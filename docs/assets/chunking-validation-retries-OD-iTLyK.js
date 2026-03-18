import{j as i}from"./main-BiZqUaIh.js";let h=`

Every LLM extraction project needs the same infrastructure: chunking, validation, retries, merging. It's boilerplate you've probably written multiple times. Here's why it's harder than it looks and how Struktur handles it.

The Boilerplate [#the-boilerplate]

Every extraction pipeline needs:

1. **Token counting** — Know when you're hitting limits
2. **Chunking** — Split documents that don't fit
3. **Prompt construction** — Build prompts per chunk
4. **API calls** — Handle rate limits, timeouts, errors
5. **Schema validation** — Check output matches schema
6. **Retry logic** — Send errors back to LLM
7. **Result merging** — Combine chunk results
8. **Deduplication** — Remove duplicates from arrays

You can build each piece. But together, they form a complex system with subtle edge cases.

Token Budgets [#token-budgets]

Why 10k Tokens Isn't Arbitrary [#why-10k-tokens-isnt-arbitrary]

LLMs have context limits. GPT-4o: 128k tokens. Claude 3.5: 200k tokens. But you can't use all of that:

* **Input tokens** — Your document + prompt
* **Output tokens** — The extracted JSON
* **Safety margin** — Room for error messages, retries

A 50-page contract might be 80k tokens. You can't process it in one call. You need to chunk.

The Chunking Problem [#the-chunking-problem]

Naive chunking breaks documents:

\`\`\`
Document: "...the total amount of $1,234,567.89 shall be paid..."

Chunk 1: "...the total amount of $1,234,"
Chunk 2: "567.89 shall be paid..."
\`\`\`

Now the LLM sees "$1,234" in one chunk and "567.89" in another. Neither is the correct total.

**Smart chunking:**

* Split at sentence boundaries
* Preserve context overlap
* Track chunk relationships

Validation in the Loop [#validation-in-the-loop]

The Problem [#the-problem]

LLMs produce invalid output:

* Missing required fields
* Wrong types (string instead of number)
* Invalid enum values
* Malformed JSON

You can't trust raw LLM output.

The Solution [#the-solution]

Validate, then retry with feedback:

\`\`\`typescript
const schema = {
  type: "object",
  properties: {
    total: { type: "number" },
    date: { type: "string", format: "date" }
  },
  required: ["total", "date"]
};

// Attempt 1
const output1 = await llm.extract(document);
const errors1 = validate(output1, schema);
// errors1: "total is required but missing"

// Attempt 2 (with feedback)
const output2 = await llm.extract(document, { 
  previousErrors: errors1 
});
const errors2 = validate(output2, schema);
// errors2: null (valid!)
\`\`\`

Why This Works [#why-this-works]

LLMs are good at correcting mistakes when told what's wrong:

\`\`\`
Previous output had validation errors:
- "total" is required but was missing
- "date" must be in YYYY-MM-DD format

Please fix these errors and try again.
\`\`\`

Most extractions converge in 2-3 attempts.

The Retry Limit [#the-retry-limit]

You can't retry forever. Set a limit:

\`\`\`typescript
const maxAttempts = 3;

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  const output = await llm.extract(document, { previousErrors });
  const errors = validate(output, schema);
  
  if (errors === null) {
    return output; // Success!
  }
}

throw new Error("Max retries exceeded");
\`\`\`

Merging Strategies [#merging-strategies]

The Problem [#the-problem-1]

Multiple chunks produce multiple results:

\`\`\`typescript
// Chunk 1 output
{ lineItems: [{ name: "Widget A", price: 100 }] }

// Chunk 2 output
{ lineItems: [{ name: "Widget B", price: 200 }] }

// Chunk 3 output
{ total: 300 }
\`\`\`

How do you combine these?

Strategy 1: LLM Merge [#strategy-1-llm-merge]

Ask the LLM to merge:

\`\`\`typescript
const merged = await llm.merge({
  results: [result1, result2, result3],
  schema: schema,
  instruction: "Combine these partial extractions into one complete result."
});
\`\`\`

**Pros:** Handles complex merging logic
**Cons:** Extra LLM call, more tokens, more cost

Strategy 2: Auto-Merge [#strategy-2-auto-merge]

Merge programmatically based on schema:

\`\`\`typescript
function autoMerge(results: object[], schema: object): object {
  const merged = {};
  
  for (const key of Object.keys(schema.properties)) {
    const propSchema = schema.properties[key];
    
    if (propSchema.type === 'array') {
      // Concatenate arrays
      merged[key] = results.flatMap(r => r[key] || []);
    } else {
      // Take first non-null value
      merged[key] = results.find(r => r[key] != null)?.[key];
    }
  }
  
  return merged;
}
\`\`\`

**Pros:** Fast, no extra tokens
**Cons:** Can't handle complex logic

Strategy 3: Schema-Aware Merge [#strategy-3-schema-aware-merge]

Combine both approaches:

* Use auto-merge for simple fields
* Use LLM merge for complex fields
* Let schema specify which to use

Deduplication [#deduplication]

The Problem [#the-problem-2]

When merging arrays, you get duplicates:

\`\`\`typescript
// Chunk 1: mentions "Widget A" twice
{ lineItems: [{ name: "Widget A" }, { name: "Widget A" }] }

// Chunk 2: also mentions "Widget A"
{ lineItems: [{ name: "Widget A" }] }

// Merged: 3 copies of "Widget A"
{ lineItems: [{ name: "Widget A" }, { name: "Widget A" }, { name: "Widget A" }] }
\`\`\`

The Solution [#the-solution-1]

Schema-aware deduplication:

\`\`\`typescript
function deduplicate(items: object[], schema: object): object[] {
  const uniqueKey = findUniqueKey(schema);
  
  if (uniqueKey) {
    // Dedupe by unique key
    const seen = new Set();
    return items.filter(item => {
      const key = item[uniqueKey];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } else {
    // Dedupe by similarity (fuzzy matching)
    return fuzzyDeduplicate(items);
  }
}
\`\`\`

How Struktur Handles This [#how-struktur-handles-this]

Struktur provides all of this out of the box:

\`\`\`typescript
import { extract } from '@struktur/sdk';

const result = await extract({
  artifacts: [{ path: 'contract.pdf' }],
  schema: contractSchema,
  strategy: 'sequential', // handles chunking + merging
  options: {
    maxRetries: 3,
    tokenBudget: 10000,
    mergeStrategy: 'auto',
  }
});

console.log(result.data);    // Validated, merged output
console.log(result.usage);   // Token usage stats
\`\`\`

Under the hood:

1. **Token counting** — Uses tiktoken for accurate counts
2. **Chunking** — Splits at sentence boundaries with overlap
3. **Validation** — JSON Schema validation with ajv
4. **Retries** — Sends errors back to LLM
5. **Merging** — Schema-aware auto-merge
6. **Deduplication** — Removes duplicates from arrays

The Hidden Complexity [#the-hidden-complexity]

Each piece seems simple. Together, they interact in complex ways:

* Chunking affects what the LLM sees
* Validation errors affect retry prompts
* Merging depends on chunk boundaries
* Deduplication depends on merge results

Building this once is educational. Building it correctly for production takes weeks.

See Also [#see-also]

* [Struktur vs Manual LLM Calls](/vs/manual-llm-calls) — The full breakdown
* [Agent vs Simple vs Parallel](/blog/agent-vs-simple-vs-parallel) — Choosing strategies
* [Quickstart Guide](/docs/quickstart) — Get started in 5 minutes
`,l={title:"The Chunking, Validation, and Retry Problem",description:"Why you keep writing the same extraction boilerplate"},a={contents:[{heading:void 0,content:"Every LLM extraction project needs the same infrastructure: chunking, validation, retries, merging. It's boilerplate you've probably written multiple times. Here's why it's harder than it looks and how Struktur handles it."},{heading:"the-boilerplate",content:"Every extraction pipeline needs:"},{heading:"the-boilerplate",content:"**Token counting** — Know when you're hitting limits"},{heading:"the-boilerplate",content:"**Chunking** — Split documents that don't fit"},{heading:"the-boilerplate",content:"**Prompt construction** — Build prompts per chunk"},{heading:"the-boilerplate",content:"**API calls** — Handle rate limits, timeouts, errors"},{heading:"the-boilerplate",content:"**Schema validation** — Check output matches schema"},{heading:"the-boilerplate",content:"**Retry logic** — Send errors back to LLM"},{heading:"the-boilerplate",content:"**Result merging** — Combine chunk results"},{heading:"the-boilerplate",content:"**Deduplication** — Remove duplicates from arrays"},{heading:"the-boilerplate",content:"You can build each piece. But together, they form a complex system with subtle edge cases."},{heading:"why-10k-tokens-isnt-arbitrary",content:"LLMs have context limits. GPT-4o: 128k tokens. Claude 3.5: 200k tokens. But you can't use all of that:"},{heading:"why-10k-tokens-isnt-arbitrary",content:"**Input tokens** — Your document + prompt"},{heading:"why-10k-tokens-isnt-arbitrary",content:"**Output tokens** — The extracted JSON"},{heading:"why-10k-tokens-isnt-arbitrary",content:"**Safety margin** — Room for error messages, retries"},{heading:"why-10k-tokens-isnt-arbitrary",content:"A 50-page contract might be 80k tokens. You can't process it in one call. You need to chunk."},{heading:"the-chunking-problem",content:"Naive chunking breaks documents:"},{heading:"the-chunking-problem",content:'Now the LLM sees "$1,234" in one chunk and "567.89" in another. Neither is the correct total.'},{heading:"the-chunking-problem",content:"**Smart chunking:**"},{heading:"the-chunking-problem",content:"Split at sentence boundaries"},{heading:"the-chunking-problem",content:"Preserve context overlap"},{heading:"the-chunking-problem",content:"Track chunk relationships"},{heading:"the-problem",content:"LLMs produce invalid output:"},{heading:"the-problem",content:"Missing required fields"},{heading:"the-problem",content:"Wrong types (string instead of number)"},{heading:"the-problem",content:"Invalid enum values"},{heading:"the-problem",content:"Malformed JSON"},{heading:"the-problem",content:"You can't trust raw LLM output."},{heading:"the-solution",content:"Validate, then retry with feedback:"},{heading:"why-this-works",content:"LLMs are good at correcting mistakes when told what's wrong:"},{heading:"why-this-works",content:"Most extractions converge in 2-3 attempts."},{heading:"the-retry-limit",content:"You can't retry forever. Set a limit:"},{heading:"the-problem-1",content:"Multiple chunks produce multiple results:"},{heading:"the-problem-1",content:"How do you combine these?"},{heading:"strategy-1-llm-merge",content:"Ask the LLM to merge:"},{heading:"strategy-1-llm-merge",content:`**Pros:** Handles complex merging logic
&#x2A;*Cons:** Extra LLM call, more tokens, more cost`},{heading:"strategy-2-auto-merge",content:"Merge programmatically based on schema:"},{heading:"strategy-2-auto-merge",content:`**Pros:** Fast, no extra tokens
&#x2A;*Cons:** Can't handle complex logic`},{heading:"strategy-3-schema-aware-merge",content:"Combine both approaches:"},{heading:"strategy-3-schema-aware-merge",content:"Use auto-merge for simple fields"},{heading:"strategy-3-schema-aware-merge",content:"Use LLM merge for complex fields"},{heading:"strategy-3-schema-aware-merge",content:"Let schema specify which to use"},{heading:"the-problem-2",content:"When merging arrays, you get duplicates:"},{heading:"the-solution-1",content:"Schema-aware deduplication:"},{heading:"how-struktur-handles-this",content:"Struktur provides all of this out of the box:"},{heading:"how-struktur-handles-this",content:"Under the hood:"},{heading:"how-struktur-handles-this",content:"**Token counting** — Uses tiktoken for accurate counts"},{heading:"how-struktur-handles-this",content:"**Chunking** — Splits at sentence boundaries with overlap"},{heading:"how-struktur-handles-this",content:"**Validation** — JSON Schema validation with ajv"},{heading:"how-struktur-handles-this",content:"**Retries** — Sends errors back to LLM"},{heading:"how-struktur-handles-this",content:"**Merging** — Schema-aware auto-merge"},{heading:"how-struktur-handles-this",content:"**Deduplication** — Removes duplicates from arrays"},{heading:"the-hidden-complexity",content:"Each piece seems simple. Together, they interact in complex ways:"},{heading:"the-hidden-complexity",content:"Chunking affects what the LLM sees"},{heading:"the-hidden-complexity",content:"Validation errors affect retry prompts"},{heading:"the-hidden-complexity",content:"Merging depends on chunk boundaries"},{heading:"the-hidden-complexity",content:"Deduplication depends on merge results"},{heading:"the-hidden-complexity",content:"Building this once is educational. Building it correctly for production takes weeks."},{heading:"see-also",content:"Struktur vs Manual LLM Calls — The full breakdown"},{heading:"see-also",content:"Agent vs Simple vs Parallel — Choosing strategies"},{heading:"see-also",content:"Quickstart Guide — Get started in 5 minutes"}],headings:[{id:"the-boilerplate",content:"The Boilerplate"},{id:"token-budgets",content:"Token Budgets"},{id:"why-10k-tokens-isnt-arbitrary",content:"Why 10k Tokens Isn't Arbitrary"},{id:"the-chunking-problem",content:"The Chunking Problem"},{id:"validation-in-the-loop",content:"Validation in the Loop"},{id:"the-problem",content:"The Problem"},{id:"the-solution",content:"The Solution"},{id:"why-this-works",content:"Why This Works"},{id:"the-retry-limit",content:"The Retry Limit"},{id:"merging-strategies",content:"Merging Strategies"},{id:"the-problem-1",content:"The Problem"},{id:"strategy-1-llm-merge",content:"Strategy 1: LLM Merge"},{id:"strategy-2-auto-merge",content:"Strategy 2: Auto-Merge"},{id:"strategy-3-schema-aware-merge",content:"Strategy 3: Schema-Aware Merge"},{id:"deduplication",content:"Deduplication"},{id:"the-problem-2",content:"The Problem"},{id:"the-solution-1",content:"The Solution"},{id:"how-struktur-handles-this",content:"How Struktur Handles This"},{id:"the-hidden-complexity",content:"The Hidden Complexity"},{id:"see-also",content:"See Also"}]};const r=[{depth:2,url:"#the-boilerplate",title:i.jsx(i.Fragment,{children:"The Boilerplate"})},{depth:2,url:"#token-budgets",title:i.jsx(i.Fragment,{children:"Token Budgets"})},{depth:3,url:"#why-10k-tokens-isnt-arbitrary",title:i.jsx(i.Fragment,{children:"Why 10k Tokens Isn't Arbitrary"})},{depth:3,url:"#the-chunking-problem",title:i.jsx(i.Fragment,{children:"The Chunking Problem"})},{depth:2,url:"#validation-in-the-loop",title:i.jsx(i.Fragment,{children:"Validation in the Loop"})},{depth:3,url:"#the-problem",title:i.jsx(i.Fragment,{children:"The Problem"})},{depth:3,url:"#the-solution",title:i.jsx(i.Fragment,{children:"The Solution"})},{depth:3,url:"#why-this-works",title:i.jsx(i.Fragment,{children:"Why This Works"})},{depth:3,url:"#the-retry-limit",title:i.jsx(i.Fragment,{children:"The Retry Limit"})},{depth:2,url:"#merging-strategies",title:i.jsx(i.Fragment,{children:"Merging Strategies"})},{depth:3,url:"#the-problem-1",title:i.jsx(i.Fragment,{children:"The Problem"})},{depth:3,url:"#strategy-1-llm-merge",title:i.jsx(i.Fragment,{children:"Strategy 1: LLM Merge"})},{depth:3,url:"#strategy-2-auto-merge",title:i.jsx(i.Fragment,{children:"Strategy 2: Auto-Merge"})},{depth:3,url:"#strategy-3-schema-aware-merge",title:i.jsx(i.Fragment,{children:"Strategy 3: Schema-Aware Merge"})},{depth:2,url:"#deduplication",title:i.jsx(i.Fragment,{children:"Deduplication"})},{depth:3,url:"#the-problem-2",title:i.jsx(i.Fragment,{children:"The Problem"})},{depth:3,url:"#the-solution-1",title:i.jsx(i.Fragment,{children:"The Solution"})},{depth:2,url:"#how-struktur-handles-this",title:i.jsx(i.Fragment,{children:"How Struktur Handles This"})},{depth:2,url:"#the-hidden-complexity",title:i.jsx(i.Fragment,{children:"The Hidden Complexity"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See Also"})}];function n(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...e.components};return i.jsxs(i.Fragment,{children:[i.jsx(s.p,{children:"Every LLM extraction project needs the same infrastructure: chunking, validation, retries, merging. It's boilerplate you've probably written multiple times. Here's why it's harder than it looks and how Struktur handles it."}),`
`,i.jsx(s.h2,{id:"the-boilerplate",children:"The Boilerplate"}),`
`,i.jsx(s.p,{children:"Every extraction pipeline needs:"}),`
`,i.jsxs(s.ol,{children:[`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Token counting"})," — Know when you're hitting limits"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Chunking"})," — Split documents that don't fit"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Prompt construction"})," — Build prompts per chunk"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"API calls"})," — Handle rate limits, timeouts, errors"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Schema validation"})," — Check output matches schema"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Retry logic"})," — Send errors back to LLM"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Result merging"})," — Combine chunk results"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Deduplication"})," — Remove duplicates from arrays"]}),`
`]}),`
`,i.jsx(s.p,{children:"You can build each piece. But together, they form a complex system with subtle edge cases."}),`
`,i.jsx(s.h2,{id:"token-budgets",children:"Token Budgets"}),`
`,i.jsx(s.h3,{id:"why-10k-tokens-isnt-arbitrary",children:"Why 10k Tokens Isn't Arbitrary"}),`
`,i.jsx(s.p,{children:"LLMs have context limits. GPT-4o: 128k tokens. Claude 3.5: 200k tokens. But you can't use all of that:"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Input tokens"})," — Your document + prompt"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Output tokens"})," — The extracted JSON"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Safety margin"})," — Room for error messages, retries"]}),`
`]}),`
`,i.jsx(s.p,{children:"A 50-page contract might be 80k tokens. You can't process it in one call. You need to chunk."}),`
`,i.jsx(s.h3,{id:"the-chunking-problem",children:"The Chunking Problem"}),`
`,i.jsx(s.p,{children:"Naive chunking breaks documents:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:'Document: "...the total amount of $1,234,567.89 shall be paid..."'})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:'Chunk 1: "...the total amount of $1,234,"'})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:'Chunk 2: "567.89 shall be paid..."'})})]})})}),`
`,i.jsx(s.p,{children:'Now the LLM sees "$1,234" in one chunk and "567.89" in another. Neither is the correct total.'}),`
`,i.jsx(s.p,{children:i.jsx(s.strong,{children:"Smart chunking:"})}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsx(s.li,{children:"Split at sentence boundaries"}),`
`,i.jsx(s.li,{children:"Preserve context overlap"}),`
`,i.jsx(s.li,{children:"Track chunk relationships"}),`
`]}),`
`,i.jsx(s.h2,{id:"validation-in-the-loop",children:"Validation in the Loop"}),`
`,i.jsx(s.h3,{id:"the-problem",children:"The Problem"}),`
`,i.jsx(s.p,{children:"LLMs produce invalid output:"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsx(s.li,{children:"Missing required fields"}),`
`,i.jsx(s.li,{children:"Wrong types (string instead of number)"}),`
`,i.jsx(s.li,{children:"Invalid enum values"}),`
`,i.jsx(s.li,{children:"Malformed JSON"}),`
`]}),`
`,i.jsx(s.p,{children:"You can't trust raw LLM output."}),`
`,i.jsx(s.h3,{id:"the-solution",children:"The Solution"}),`
`,i.jsx(s.p,{children:"Validate, then retry with feedback:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" schema"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  type: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"object"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  properties: {"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    total: { type: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"number"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    date: { type: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"string"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", format: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"date"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  required: ["}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"total"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"date"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"};"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Attempt 1"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" output1"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" llm."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(document);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" errors1"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" validate"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(output1, schema);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// errors1: "total is required but missing"'})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Attempt 2 (with feedback)"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" output2"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" llm."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(document, { "})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  previousErrors: errors1 "})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" errors2"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" validate"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(output2, schema);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// errors2: null (valid!)"})})]})})}),`
`,i.jsx(s.h3,{id:"why-this-works",children:"Why This Works"}),`
`,i.jsx(s.p,{children:"LLMs are good at correcting mistakes when told what's wrong:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:"Previous output had validation errors:"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:'- "total" is required but was missing'})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:'- "date" must be in YYYY-MM-DD format'})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{children:"Please fix these errors and try again."})})]})})}),`
`,i.jsx(s.p,{children:"Most extractions converge in 2-3 attempts."}),`
`,i.jsx(s.h3,{id:"the-retry-limit",children:"The Retry Limit"}),`
`,i.jsx(s.p,{children:"You can't retry forever. Set a limit:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" maxAttempts"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 3"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"let"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" attempt "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; attempt "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" maxAttempts; attempt"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"++"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" output"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" llm."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(document, { previousErrors });"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" errors"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" validate"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(output, schema);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (errors "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" output; "}),i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Success!"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throw"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Error"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Max retries exceeded"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]})]})})}),`
`,i.jsx(s.h2,{id:"merging-strategies",children:"Merging Strategies"}),`
`,i.jsx(s.h3,{id:"the-problem-1",children:"The Problem"}),`
`,i.jsx(s.p,{children:"Multiple chunks produce multiple results:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Chunk 1 output"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lineItems"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": [{ name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"100"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }] }"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Chunk 2 output"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lineItems"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": [{ name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget B"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", price: "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"200"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }] }"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Chunk 3 output"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"total"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"300"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})]})})}),`
`,i.jsx(s.p,{children:"How do you combine these?"}),`
`,i.jsx(s.h3,{id:"strategy-1-llm-merge",children:"Strategy 1: LLM Merge"}),`
`,i.jsx(s.p,{children:"Ask the LLM to merge:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" merged"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" llm."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"merge"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  results: [result1, result2, result3],"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: schema,"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  instruction: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Combine these partial extractions into one complete result."'})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,i.jsxs(s.p,{children:[i.jsx(s.strong,{children:"Pros:"}),` Handles complex merging logic
`,i.jsx(s.strong,{children:"Cons:"})," Extra LLM call, more tokens, more cost"]}),`
`,i.jsx(s.h3,{id:"strategy-2-auto-merge",children:"Strategy 2: Auto-Merge"}),`
`,i.jsx(s.p,{children:"Merge programmatically based on schema:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"function"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" autoMerge"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"results"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" object"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[], "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"schema"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" object"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" object"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" merged"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {};"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  for"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" key"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" of"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Object."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"keys"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(schema.properties)) {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" propSchema"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" schema.properties[key];"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    "})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    if"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (propSchema.type "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"==="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'array'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Concatenate arrays"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      merged[key] "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" results."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"flatMap"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"r"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" =>"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r[key] "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"||"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" []);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    } "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Take first non-null value"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      merged[key] "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" results."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"find"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"r"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" =>"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" r[key] "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!="}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" null"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")?.[key];"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" merged;"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsxs(s.p,{children:[i.jsx(s.strong,{children:"Pros:"}),` Fast, no extra tokens
`,i.jsx(s.strong,{children:"Cons:"})," Can't handle complex logic"]}),`
`,i.jsx(s.h3,{id:"strategy-3-schema-aware-merge",children:"Strategy 3: Schema-Aware Merge"}),`
`,i.jsx(s.p,{children:"Combine both approaches:"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsx(s.li,{children:"Use auto-merge for simple fields"}),`
`,i.jsx(s.li,{children:"Use LLM merge for complex fields"}),`
`,i.jsx(s.li,{children:"Let schema specify which to use"}),`
`]}),`
`,i.jsx(s.h2,{id:"deduplication",children:"Deduplication"}),`
`,i.jsx(s.h3,{id:"the-problem-2",children:"The Problem"}),`
`,i.jsx(s.p,{children:"When merging arrays, you get duplicates:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// Chunk 1: mentions "Widget A" twice'})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lineItems"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": [{ name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }, { name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }] }"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// Chunk 2: also mentions "Widget A"'})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lineItems"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": [{ name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }] }"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// Merged: 3 copies of "Widget A"'})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lineItems"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": [{ name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }, { name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }, { name: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Widget A"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }] }"})]})]})})}),`
`,i.jsx(s.h3,{id:"the-solution-1",children:"The Solution"}),`
`,i.jsx(s.p,{children:"Schema-aware deduplication:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"function"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" deduplicate"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"items"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" object"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[], "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"schema"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" object"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" object"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" uniqueKey"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" findUniqueKey"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(schema);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  "})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  if"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (uniqueKey) {"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Dedupe by unique key"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" seen"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Set"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" items."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"filter"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"item"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" =>"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" key"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" item[uniqueKey];"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      if"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (seen."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"has"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key)) "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"return"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      seen."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"add"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(key);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      return"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    });"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  } "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"else"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Dedupe by similarity (fuzzy matching)"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" fuzzyDeduplicate"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(items);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,i.jsx(s.h2,{id:"how-struktur-handles-this",children:"How Struktur Handles This"}),`
`,i.jsx(s.p,{children:"Struktur provides all of this out of the box:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract } "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '@struktur/sdk'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts: [{ path: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'contract.pdf'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }],"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema: contractSchema,"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'sequential'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// handles chunking + merging"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  options: {"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    maxRetries: "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    tokenBudget: "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"10000"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    mergeStrategy: "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'auto'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.data);    "}),i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Validated, merged output"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.usage);   "}),i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Token usage stats"})]})]})})}),`
`,i.jsx(s.p,{children:"Under the hood:"}),`
`,i.jsxs(s.ol,{children:[`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Token counting"})," — Uses tiktoken for accurate counts"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Chunking"})," — Splits at sentence boundaries with overlap"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Validation"})," — JSON Schema validation with ajv"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Retries"})," — Sends errors back to LLM"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Merging"})," — Schema-aware auto-merge"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.strong,{children:"Deduplication"})," — Removes duplicates from arrays"]}),`
`]}),`
`,i.jsx(s.h2,{id:"the-hidden-complexity",children:"The Hidden Complexity"}),`
`,i.jsx(s.p,{children:"Each piece seems simple. Together, they interact in complex ways:"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsx(s.li,{children:"Chunking affects what the LLM sees"}),`
`,i.jsx(s.li,{children:"Validation errors affect retry prompts"}),`
`,i.jsx(s.li,{children:"Merging depends on chunk boundaries"}),`
`,i.jsx(s.li,{children:"Deduplication depends on merge results"}),`
`]}),`
`,i.jsx(s.p,{children:"Building this once is educational. Building it correctly for production takes weeks."}),`
`,i.jsx(s.h2,{id:"see-also",children:"See Also"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/vs/manual-llm-calls",children:"Struktur vs Manual LLM Calls"})," — The full breakdown"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/blog/agent-vs-simple-vs-parallel",children:"Agent vs Simple vs Parallel"})," — Choosing strategies"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/docs/quickstart",children:"Quickstart Guide"})," — Get started in 5 minutes"]}),`
`]})]})}function d(e={}){const{wrapper:s}=e.components||{};return s?i.jsx(s,{...e,children:i.jsx(n,{...e})}):n(e)}export{h as _markdown,d as default,l as frontmatter,a as structuredData,r as toc};
