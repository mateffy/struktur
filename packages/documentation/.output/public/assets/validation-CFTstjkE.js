import{j as e}from"./main-BBiFs8Yq.js";let r=`

Why validation inside the loop? [#why-validation-inside-the-loop]

Without in-loop validation, you get JSON that may or may not match your schema. You then have to write error handling, decide whether to retry, and figure out how to feed errors back.

Struktur does all of this for you.

How the retry loop works [#how-the-retry-loop-works]

1. Send the extraction prompt to the LLM.
2. Validate the response against the schema.
3. If valid: return it.
4. If invalid: serialize the validation errors into an XML block, append it to the message thread as a user message, go to step 1.
5. After \`maxAttempts\` (default 3): throw.

The model sees its own mistake and a structured description of it. This self-correction loop is why most extractions converge within 2 attempts.

Schema design affects retry rate [#schema-design-affects-retry-rate]

Well-constrained schemas fail less often. Tips:

* Always use \`additionalProperties: false\`.
* Use \`required\` arrays explicitly.
* Prefer \`enum\` for categorical fields.
* Use \`format\` (e.g., \`date\`, \`email\`) only when you need it — it adds validation surface.

Observing retries with events [#observing-retries-with-events]

Use the \`onMessage\` event to see when retries happen:

\`\`\`js
events: {
  onMessage: ({ role, content }) => {
    if (role === "user" && String(content).includes("validation-errors")) {
      console.log("Retry triggered");
    }
  }
}
\`\`\`

Smart Validation for Multi-Step Strategies [#smart-validation-for-multi-step-strategies]

When using parallel or sequential strategies, your data might be split across multiple chunks. For example, an invoice's price might appear on page 1, while the vendor name appears on page 5. If both fields are \`required\` in your schema, validating intermediate results would fail unnecessarily.

How smart validation works [#how-smart-validation-works]

Struktur uses **lenient validation** during intermediate extraction steps:

* **Type errors** (\`string\` vs \`number\`) → Retry immediately
* **Format errors** (invalid email) → Retry immediately
* **Required field errors** → Allowed during intermediate steps
* **All constraints** → Enforced on final validation

This means the model can extract partial data without pressure to hallucinate missing required fields. The final validation ensures all required fields are present before returning.

Opting into strict validation [#opting-into-strict-validation]

Disable smart validation with the \`strict\` flag:

\`\`\`js
const result = await extract({
  artifacts,
  schema,
  strategy: parallel({
    model: openai("gpt-4o-mini"),
    mergeModel: openai("gpt-4o-mini"),
    strict: true, // Validate required fields on every step
  }),
});
\`\`\`

Use \`strict: true\` when:

* You know each chunk contains complete data
* You want early failure on missing fields
* You're debugging extraction issues

See also [#see-also]

* [The Extraction Pipeline](/docs/explanation/pipeline) — where validation fits
* [Events & Observability](/docs/sdk/events) — the events API
* [The Artifact Format](/docs/explanation/artifact-format) — schema format
`,a={title:"Validation & Retries",description:"How the schema validation loop works and why it matters."},l={contents:[{heading:"why-validation-inside-the-loop",content:"Without in-loop validation, you get JSON that may or may not match your schema. You then have to write error handling, decide whether to retry, and figure out how to feed errors back."},{heading:"why-validation-inside-the-loop",content:"Struktur does all of this for you."},{heading:"how-the-retry-loop-works",content:"Send the extraction prompt to the LLM."},{heading:"how-the-retry-loop-works",content:"Validate the response against the schema."},{heading:"how-the-retry-loop-works",content:"If valid: return it."},{heading:"how-the-retry-loop-works",content:"If invalid: serialize the validation errors into an XML block, append it to the message thread as a user message, go to step 1."},{heading:"how-the-retry-loop-works",content:"After `maxAttempts` (default 3): throw."},{heading:"how-the-retry-loop-works",content:"The model sees its own mistake and a structured description of it. This self-correction loop is why most extractions converge within 2 attempts."},{heading:"schema-design-affects-retry-rate",content:"Well-constrained schemas fail less often. Tips:"},{heading:"schema-design-affects-retry-rate",content:"Always use `additionalProperties: false`."},{heading:"schema-design-affects-retry-rate",content:"Use `required` arrays explicitly."},{heading:"schema-design-affects-retry-rate",content:"Prefer `enum` for categorical fields."},{heading:"schema-design-affects-retry-rate",content:"Use `format` (e.g., `date`, `email`) only when you need it — it adds validation surface."},{heading:"observing-retries-with-events",content:"Use the `onMessage` event to see when retries happen:"},{heading:"smart-validation-for-multi-step-strategies",content:"When using parallel or sequential strategies, your data might be split across multiple chunks. For example, an invoice's price might appear on page 1, while the vendor name appears on page 5. If both fields are `required` in your schema, validating intermediate results would fail unnecessarily."},{heading:"how-smart-validation-works",content:"Struktur uses **lenient validation** during intermediate extraction steps:"},{heading:"how-smart-validation-works",content:"**Type errors** (`string` vs `number`) → Retry immediately"},{heading:"how-smart-validation-works",content:"**Format errors** (invalid email) → Retry immediately"},{heading:"how-smart-validation-works",content:"**Required field errors** → Allowed during intermediate steps"},{heading:"how-smart-validation-works",content:"**All constraints** → Enforced on final validation"},{heading:"how-smart-validation-works",content:"This means the model can extract partial data without pressure to hallucinate missing required fields. The final validation ensures all required fields are present before returning."},{heading:"opting-into-strict-validation",content:"Disable smart validation with the `strict` flag:"},{heading:"opting-into-strict-validation",content:"Use `strict: true` when:"},{heading:"opting-into-strict-validation",content:"You know each chunk contains complete data"},{heading:"opting-into-strict-validation",content:"You want early failure on missing fields"},{heading:"opting-into-strict-validation",content:"You're debugging extraction issues"},{heading:"see-also",content:"The Extraction Pipeline — where validation fits"},{heading:"see-also",content:"Events & Observability — the events API"},{heading:"see-also",content:"The Artifact Format — schema format"}],headings:[{id:"why-validation-inside-the-loop",content:"Why validation inside the loop?"},{id:"how-the-retry-loop-works",content:"How the retry loop works"},{id:"schema-design-affects-retry-rate",content:"Schema design affects retry rate"},{id:"observing-retries-with-events",content:"Observing retries with events"},{id:"smart-validation-for-multi-step-strategies",content:"Smart Validation for Multi-Step Strategies"},{id:"how-smart-validation-works",content:"How smart validation works"},{id:"opting-into-strict-validation",content:"Opting into strict validation"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#why-validation-inside-the-loop",title:e.jsx(e.Fragment,{children:"Why validation inside the loop?"})},{depth:2,url:"#how-the-retry-loop-works",title:e.jsx(e.Fragment,{children:"How the retry loop works"})},{depth:2,url:"#schema-design-affects-retry-rate",title:e.jsx(e.Fragment,{children:"Schema design affects retry rate"})},{depth:2,url:"#observing-retries-with-events",title:e.jsx(e.Fragment,{children:"Observing retries with events"})},{depth:2,url:"#smart-validation-for-multi-step-strategies",title:e.jsx(e.Fragment,{children:"Smart Validation for Multi-Step Strategies"})},{depth:3,url:"#how-smart-validation-works",title:e.jsx(e.Fragment,{children:"How smart validation works"})},{depth:3,url:"#opting-into-strict-validation",title:e.jsx(e.Fragment,{children:"Opting into strict validation"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function s(t){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"why-validation-inside-the-loop",children:"Why validation inside the loop?"}),`
`,e.jsx(i.p,{children:"Without in-loop validation, you get JSON that may or may not match your schema. You then have to write error handling, decide whether to retry, and figure out how to feed errors back."}),`
`,e.jsx(i.p,{children:"Struktur does all of this for you."}),`
`,e.jsx(i.h2,{id:"how-the-retry-loop-works",children:"How the retry loop works"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Send the extraction prompt to the LLM."}),`
`,e.jsx(i.li,{children:"Validate the response against the schema."}),`
`,e.jsx(i.li,{children:"If valid: return it."}),`
`,e.jsx(i.li,{children:"If invalid: serialize the validation errors into an XML block, append it to the message thread as a user message, go to step 1."}),`
`,e.jsxs(i.li,{children:["After ",e.jsx(i.code,{children:"maxAttempts"})," (default 3): throw."]}),`
`]}),`
`,e.jsx(i.p,{children:"The model sees its own mistake and a structured description of it. This self-correction loop is why most extractions converge within 2 attempts."}),`
`,e.jsx(i.h2,{id:"schema-design-affects-retry-rate",children:"Schema design affects retry rate"}),`
`,e.jsx(i.p,{children:"Well-constrained schemas fail less often. Tips:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["Always use ",e.jsx(i.code,{children:"additionalProperties: false"}),"."]}),`
`,e.jsxs(i.li,{children:["Use ",e.jsx(i.code,{children:"required"})," arrays explicitly."]}),`
`,e.jsxs(i.li,{children:["Prefer ",e.jsx(i.code,{children:"enum"})," for categorical fields."]}),`
`,e.jsxs(i.li,{children:["Use ",e.jsx(i.code,{children:"format"})," (e.g., ",e.jsx(i.code,{children:"date"}),", ",e.jsx(i.code,{children:"email"}),") only when you need it — it adds validation surface."]}),`
`]}),`
`,e.jsx(i.h2,{id:"observing-retries-with-events",children:"Observing retries with events"}),`
`,e.jsxs(i.p,{children:["Use the ",e.jsx(i.code,{children:"onMessage"})," event to see when retries happen:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"events"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  onMessage"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"role"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"content"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (role "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "user"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" &&"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" String"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(content)."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"includes"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"validation-errors"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Retry triggered"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsx(i.h2,{id:"smart-validation-for-multi-step-strategies",children:"Smart Validation for Multi-Step Strategies"}),`
`,e.jsxs(i.p,{children:["When using parallel or sequential strategies, your data might be split across multiple chunks. For example, an invoice's price might appear on page 1, while the vendor name appears on page 5. If both fields are ",e.jsx(i.code,{children:"required"})," in your schema, validating intermediate results would fail unnecessarily."]}),`
`,e.jsx(i.h3,{id:"how-smart-validation-works",children:"How smart validation works"}),`
`,e.jsxs(i.p,{children:["Struktur uses ",e.jsx(i.strong,{children:"lenient validation"})," during intermediate extraction steps:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Type errors"})," (",e.jsx(i.code,{children:"string"})," vs ",e.jsx(i.code,{children:"number"}),") → Retry immediately"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Format errors"})," (invalid email) → Retry immediately"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"Required field errors"})," → Allowed during intermediate steps"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"All constraints"})," → Enforced on final validation"]}),`
`]}),`
`,e.jsx(i.p,{children:"This means the model can extract partial data without pressure to hallucinate missing required fields. The final validation ensures all required fields are present before returning."}),`
`,e.jsx(i.h3,{id:"opting-into-strict-validation",children:"Opting into strict validation"}),`
`,e.jsxs(i.p,{children:["Disable smart validation with the ",e.jsx(i.code,{children:"strict"})," flag:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mergeModel: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"),"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    strict: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Validate required fields on every step"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }),"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"strict: true"})," when:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"You know each chunk contains complete data"}),`
`,e.jsx(i.li,{children:"You want early failure on missing fields"}),`
`,e.jsx(i.li,{children:"You're debugging extraction issues"}),`
`]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/pipeline",children:"The Extraction Pipeline"})," — where validation fits"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/sdk/events",children:"Events & Observability"})," — the events API"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/artifact-format",children:"The Artifact Format"})," — schema format"]}),`
`]})]})}function o(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(s,{...t})}):s(t)}export{r as _markdown,o as default,a as frontmatter,l as structuredData,h as toc};
