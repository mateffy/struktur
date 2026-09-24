

Why validation inside the loop? [#why-validation-inside-the-loop]

Without in-loop validation, you get JSON that may or may not match your schema. You then have to write error handling, decide whether to retry, and figure out how to feed errors back.

Struktur does all of this for you.

How the retry loop works [#how-the-retry-loop-works]

1. Send the extraction prompt to the LLM.
2. Validate the response against the schema.
3. If valid: return it.
4. If invalid: serialize the validation errors into an XML block, append it to the message thread as a user message, go to step 1.
5. After `maxAttempts` (default 3): throw.

The model sees its own mistake and a structured description of it. This self-correction loop is why most extractions converge within 2 attempts.

Schema design affects retry rate [#schema-design-affects-retry-rate]

Well-constrained schemas fail less often. Tips:

* Always use `additionalProperties: false`.
* Use `required` arrays explicitly.
* Prefer `enum` for categorical fields.
* Use `format` (e.g., `date`, `email`) only when you need it — it adds validation surface.

Observing retries with events [#observing-retries-with-events]

Use the `onMessage` event to see when retries happen:

```js
events: {
  onMessage: ({ role, content }) => {
    if (role === "user" && String(content).includes("validation-errors")) {
      console.log("Retry triggered");
    }
  }
}
```

Smart Validation for Multi-Step Strategies [#smart-validation-for-multi-step-strategies]

When using parallel or sequential strategies, your data might be split across multiple chunks. For example, an invoice's price might appear on page 1, while the vendor name appears on page 5. If both fields are `required` in your schema, validating intermediate results would fail unnecessarily.

How smart validation works [#how-smart-validation-works]

Struktur uses **lenient validation** during intermediate extraction steps:

* **Type errors** (`string` vs `number`) → Retry immediately
* **Format errors** (invalid email) → Retry immediately
* **Required field errors** → Allowed during intermediate steps
* **All constraints** → Enforced on final validation

This means the model can extract partial data without pressure to hallucinate missing required fields. The final validation ensures all required fields are present before returning.

Opting into strict validation [#opting-into-strict-validation]

Disable smart validation with the `strict` flag:

```js
const result = await extract({
  artifacts,
  schema,
  strategy: parallel({
    model: openai("gpt-4o-mini"),
    mergeModel: openai("gpt-4o-mini"),
    strict: true, // Validate required fields on every step
  }),
});
```

Use `strict: true` when:

* You know each chunk contains complete data
* You want early failure on missing fields
* You're debugging extraction issues

Agent strategy validation [#agent-strategy-validation]

The agent does not produce one JSON object per attempt. It builds the output incrementally with `set_output_data` / `update_output_data` tool calls while it explores the document, so validation happens at two points instead of one retry loop:

1. **On every tool call — values only.** The tool schema is derived from yours with `required` removed. The agent may submit an incomplete object at any time, but every value it submits must still be valid. An out-of-enum value, a wrong type or a malformed structure is rejected by the tool call itself and returned to the model as a tool error it can correct on its next step. This is the agent equivalent of the retry loop above, and it runs on every update rather than only at the end.
2. **On `finish()` — the whole object.** When the agent declares it is done, the accumulated output is validated against your full schema. On failure the errors are appended to the conversation and the agent keeps working, up to `maxValidationAttempts` (default 3). If it still cannot produce valid output, the run throws `SchemaValidationError` and the CLI exits non-zero.

If the model answers with text instead of calling `finish()` — because it is asking a question, narrating progress, or believes it is done — it is nudged back with instructions to save its output and call `finish()`, up to 3 times.

A successful agent run is therefore always schema-valid: invalid values never reach `result.data`. Missing required fields are still tolerated when `strict` is off, exactly as described above.

See also [#see-also]

* [The Extraction Pipeline](/docs/explanation/pipeline) — where validation fits
* [Events & Observability](/docs/sdk/events) — the events API
* [The Artifact Format](/docs/explanation/artifact-format) — schema format
