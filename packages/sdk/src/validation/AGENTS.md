# Validation module

## Purpose
Schema validation and error shaping for LLM response validation in the extraction pipeline.
AJV has been replaced with **Zod v4** (`z.fromJSONSchema`) for edge/Cloudflare Workers compatibility
(AJV uses `new Function()` which is prohibited in Workers runtimes).

## Key files
- `validator.ts` — core validator factory and types
- `validator.test.ts` — comprehensive tests for all three schema paths

## Supported schema types

### 1. Plain JSON Schema (`Record<string, unknown>`)
- Compiled once via `z.fromJSONSchema()` (experimental Zod v4 API)
- Custom `format: "artifact-id"` is pre-processed to an equivalent `pattern` before compilation
- Schema is cached per `Validator` instance to avoid recompilation

### 2. Standard Schema V1 (`~standard.validate`)
- Any library implementing the [Standard Schema spec](https://standardschema.dev/) works directly
- Includes Zod v4, Valibot, ArkType, and others
- The `~standard.validate()` function is called directly — no JSON Schema conversion needed
- Async `validate()` is NOT supported (throws immediately)

### 3. Zod schemas (subset of Standard Schema)
- Detected via `~standard.vendor === "zod"`
- Uses the Standard Schema path for validation (`~standard.validate`)
- `toJsonSchema()` uses `z.toJSONSchema()` to extract JSON Schema for LLM prompts

## Key exports
- `createValidator(schema)` — returns a `Validator` object; the main factory
- `Validator` — `{ validateOrThrow<T>(data): T, validateAllowingMissingRequired<T>(data, isFinalAttempt?): ValidationResult<T> }`
- `isStandardSchema(schema)` — predicate for Standard Schema detection
- `isZodSchema(schema)` — predicate for Zod-specific detection (via vendor field)
- `toJsonSchema(schema)` — extracts JSON Schema from any schema type (for LLM prompts)
- `SchemaValidationError` — extends `Error` with `errors: ValidationIssue[]`
- `ValidationIssue` — normalized error type: `{ message, path?, keyword? }`
- `isRequiredError(issue)` — returns true when `issue.keyword === "required"`
- `StandardSchema<Input, Output>` — inlined Standard Schema V1 type (no external dep required)

## Error keyword mapping (Zod v4)
Zod v4 doesn't populate `input` on issues; the only signal is the `message` string:
- `"received undefined"` in message → `keyword: "required"` (field was absent)
- Any other `invalid_type` → `keyword: "type"` (wrong type for present value)
- `invalid_format` → `keyword: "format"`
- `unrecognized_keys` → `keyword: "additionalProperties"`

## Custom formats
- `artifact-id`: Strings matching `^artifact:[^/]+/images/image\d+\.\w+$`
  Pre-processed in `normalizeJsonSchema()` to convert `format: "artifact-id"` to the
  equivalent `pattern` before passing to `z.fromJSONSchema`.

## Retry loop integration
`validateAllowingMissingRequired` is designed for the extraction retry loop:
- Non-final attempt: only accept if valid OR if all errors are `required`-keyword issues
  (allows the LLM to be retried with a schema hint about missing fields)
- Final attempt: accept partial data if the only errors are missing required fields
  (lenient acceptance of partial LLM output)

## Cloudflare Workers compatibility
No `eval`, no `new Function`. Zod v4's `fromJSONSchema` is pure JS.
Requires `nodejs_compat` flag only if other SDK modules need it (auth, fs paths, etc.).
