import{j as s}from"./main-CqW1cql0.js";let h=`

The interface [#the-interface]

A strategy has:

\`\`\`js
const myStrategy = {
  name: "my-strategy",

  // Optional: used by CLI progress bar.
  getEstimatedSteps(artifacts) {
    return 3;
  },

  async run(options) {
    // Your orchestration logic here.
    return { data: ..., usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } };
  },
};
\`\`\`

Using built-in helpers [#using-built-in-helpers]

Key internal helpers from \`strategies/utils.ts\`:

| Helper                                                                            | Description                              |
| --------------------------------------------------------------------------------- | ---------------------------------------- |
| \`getBatches(artifacts, { maxTokens, maxImages? })\`                                | Chunk artifacts into batches             |
| \`extractWithPrompt({ model, schema, system, user, artifacts, events, execute? })\` | Run one LLM extraction with retries      |
| \`serializeSchema(schema)\`                                                         | Convert schema to JSON string for prompt |
| \`mergeUsage([...usages])\`                                                         | Accumulate usage across calls            |

A complete example [#a-complete-example]

\`\`\`js
import { extractWithPrompt, getBatches, mergeUsage, serializeSchema } from "@mateffy/struktur/strategies/utils";
import { buildExtractorPrompt } from "@mateffy/struktur/prompts/ExtractorPrompt";

const myStrategy = (config) => ({
  name: "my-strategy",

  getEstimatedSteps(artifacts) {
    const batches = getBatches(artifacts, { maxTokens: config.chunkSize });
    return batches.length + 1;
  },

  async run(options) {
    const batches = getBatches(options.artifacts, {
      maxTokens: config.chunkSize,
    });

    const schema = serializeSchema(options.schema);
    const usages = [];
    let currentData = {};

    for (const [index, batch] of batches.entries()) {
      const prompt = buildExtractorPrompt(batch, schema);

      const result = await extractWithPrompt({
        model: config.model,
        schema: options.schema,
        system: prompt.system,
        user: prompt.user,
        artifacts: batch,
        events: options.events,
      });

      currentData = { ...currentData, ...result.data };
      usages.push(result.usage);

      await options.events?.onStep?.({
        step: index + 1,
        total: batches.length + 1,
        label: \`batch \${index + 1}/\${batches.length}\`,
      });
    }

    return { data: currentData, usage: mergeUsage(usages) };
  },
});
\`\`\`

Emitting step events [#emitting-step-events]

Strategies should emit \`events.onStep\` for progress tracking:

\`\`\`js
await options.events?.onStep?.({
  step: 1,
  total: 3,
  label: "extract",
});
\`\`\`

See also [#see-also]

* [What are Strategies](/docs/explanation/strategies) — built-in strategies
* [Choosing a Strategy](/docs/explanation/strategies/choosing) — decision guide
`,l={title:"Writing a Custom Strategy",description:"How to implement your own extraction strategy."},a={contents:[{heading:"the-interface",content:"A strategy has:"},{heading:"using-built-in-helpers",content:"Key internal helpers from `strategies/utils.ts`:"},{heading:"using-built-in-helpers",content:"Helper"},{heading:"using-built-in-helpers",content:"Description"},{heading:"using-built-in-helpers",content:"`getBatches(artifacts, { maxTokens, maxImages? })`"},{heading:"using-built-in-helpers",content:"Chunk artifacts into batches"},{heading:"using-built-in-helpers",content:"`extractWithPrompt({ model, schema, system, user, artifacts, events, execute? })`"},{heading:"using-built-in-helpers",content:"Run one LLM extraction with retries"},{heading:"using-built-in-helpers",content:"`serializeSchema(schema)`"},{heading:"using-built-in-helpers",content:"Convert schema to JSON string for prompt"},{heading:"using-built-in-helpers",content:"`mergeUsage([...usages])`"},{heading:"using-built-in-helpers",content:"Accumulate usage across calls"},{heading:"emitting-step-events",content:"Strategies should emit `events.onStep` for progress tracking:"},{heading:"see-also",content:"What are Strategies — built-in strategies"},{heading:"see-also",content:"Choosing a Strategy — decision guide"}],headings:[{id:"the-interface",content:"The interface"},{id:"using-built-in-helpers",content:"Using built-in helpers"},{id:"a-complete-example",content:"A complete example"},{id:"emitting-step-events",content:"Emitting step events"},{id:"see-also",content:"See also"}]};const r=[{depth:2,url:"#the-interface",title:s.jsx(s.Fragment,{children:"The interface"})},{depth:2,url:"#using-built-in-helpers",title:s.jsx(s.Fragment,{children:"Using built-in helpers"})},{depth:2,url:"#a-complete-example",title:s.jsx(s.Fragment,{children:"A complete example"})},{depth:2,url:"#emitting-step-events",title:s.jsx(s.Fragment,{children:"Emitting step events"})},{depth:2,url:"#see-also",title:s.jsx(s.Fragment,{children:"See also"})}];function n(e){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...e.components};return s.jsxs(s.Fragment,{children:[s.jsx(i.h2,{id:"the-interface",children:"The interface"}),`
`,s.jsx(i.p,{children:"A strategy has:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" myStrategy"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  name: "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"my-strategy"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"  // Optional: used by CLI progress bar."})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  getEstimatedSteps"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"artifacts"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 3"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  async"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" run"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"options"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    // Your orchestration logic here."})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { data: "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", usage: { inputTokens: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", outputTokens: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", totalTokens: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" } };"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"};"})})]})})}),`
`,s.jsx(i.h2,{id:"using-built-in-helpers",children:"Using built-in helpers"}),`
`,s.jsxs(i.p,{children:["Key internal helpers from ",s.jsx(i.code,{children:"strategies/utils.ts"}),":"]}),`
`,s.jsxs(i.table,{children:[s.jsx(i.thead,{children:s.jsxs(i.tr,{children:[s.jsx(i.th,{children:"Helper"}),s.jsx(i.th,{children:"Description"})]})}),s.jsxs(i.tbody,{children:[s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"getBatches(artifacts, { maxTokens, maxImages? })"})}),s.jsx(i.td,{children:"Chunk artifacts into batches"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"extractWithPrompt({ model, schema, system, user, artifacts, events, execute? })"})}),s.jsx(i.td,{children:"Run one LLM extraction with retries"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"serializeSchema(schema)"})}),s.jsx(i.td,{children:"Convert schema to JSON string for prompt"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"mergeUsage([...usages])"})}),s.jsx(i.td,{children:"Accumulate usage across calls"})]})]})]}),`
`,s.jsx(i.h2,{id:"a-complete-example",children:"A complete example"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extractWithPrompt, getBatches, mergeUsage, serializeSchema } "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur/strategies/utils"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { buildExtractorPrompt } "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur/prompts/ExtractorPrompt"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" myStrategy"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),s.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"config"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ({"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  name: "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"my-strategy"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  getEstimatedSteps"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"artifacts"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" batches"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getBatches"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(artifacts, { maxTokens: config.chunkSize });"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" batches."}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"length"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  async"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" run"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),s.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"options"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" batches"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" getBatches"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(options.artifacts, {"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      maxTokens: config.chunkSize,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    });"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" schema"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" serializeSchema"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(options.schema);"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" usages"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [];"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    let"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" currentData "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {};"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    for"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ["}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"index"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"batch"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"of"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" batches."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"entries"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" prompt"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" buildExtractorPrompt"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(batch, schema);"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      const"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extractWithPrompt"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        model: config.model,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        schema: options.schema,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        system: prompt.system,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        user: prompt.user,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        artifacts: batch,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        events: options.events,"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      });"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      currentData "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"currentData, "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"result.data };"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      usages."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"push"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.usage);"})]}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      await"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" options.events?."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"onStep"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?.({"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        step: index "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"+"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        total: batches."}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"length"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        label: "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`batch ${"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"index"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" +"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/${"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"batches"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"."}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"length"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}`"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      });"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    return"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { data: currentData, usage: "}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mergeUsage"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(usages) };"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,s.jsx(i.h2,{id:"emitting-step-events",children:"Emitting step events"}),`
`,s.jsxs(i.p,{children:["Strategies should emit ",s.jsx(i.code,{children:"events.onStep"})," for progress tracking:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"await"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" options.events?."}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"onStep"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"?.({"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  step: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  total: "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"3"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  label: "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"extract"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,s.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:[s.jsx(i.a,{href:"/docs/explanation/strategies",children:"What are Strategies"})," — built-in strategies"]}),`
`,s.jsxs(i.li,{children:[s.jsx(i.a,{href:"/docs/explanation/strategies/choosing",children:"Choosing a Strategy"})," — decision guide"]}),`
`]})]})}function c(e={}){const{wrapper:i}=e.components||{};return i?s.jsx(i,{...e,children:s.jsx(n,{...e})}):n(e)}export{h as _markdown,c as default,l as frontmatter,a as structuredData,r as toc};
