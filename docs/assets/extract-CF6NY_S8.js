import{j as e,at as n,ay as r}from"./main-Ca2d6S-S.js";let l=`

import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Callout } from 'fumadocs-ui/components/callout';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';

Usage [#usage]

\`\`\`js
import { extract, simple } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: simple({ model: openai("gpt-4o-mini") }),
});

console.log(result.data);
console.log(result.usage.totalTokens);
\`\`\`

Options [#options]

<TypeTable
  type={{
  artifacts: {
    description: 'Array of artifacts to extract from',
    type: 'Artifact[]',
    required: true,
  },
  schema: {
    description: 'JSON Schema for output validation (one of schema or fields required)',
    type: 'AnyJSONSchema',
    required: false,
  },
  fields: {
    description: 'Fields shorthand — comma-separated field definitions',
    type: 'string',
    required: false,
  },
  strategy: {
    description: 'A strategy instance',
    type: 'Strategy',
    required: true,
  },
  events: {
    description: 'Event handlers for progress tracking',
    type: 'Events',
    required: false,
  },
}}
/>

<Callout type="warn">
  Exactly one of \`schema\` or \`fields\` must be provided. Passing both, or neither, throws immediately.
</Callout>

Result [#result]

<TypeTable
  type={{
  data: {
    description: 'Validated output matching your schema',
    type: 'T',
    required: true,
  },
  usage: {
    description: 'Token counts: inputTokens, outputTokens, totalTokens',
    type: 'Usage',
    required: true,
  },
  error: {
    description: 'Set if extraction encountered a non-fatal error',
    type: 'Error | undefined',
    required: false,
  },
}}
/>

Using fields instead of schema [#using-fields-instead-of-schema]

For quick extractions where you don't need full JSON Schema control, pass a \`fields\` string:

\`\`\`ts
const result = await extract({
  artifacts,
  fields: "title, author, year:integer, genre:enum{fiction|nonfiction|reference}",
  strategy: simple({ model: openai("gpt-4o-mini") }),
});
\`\`\`

\`fields\` supports scalar types (\`string\`, \`number\`/\`float\`, \`boolean\`/\`bool\`, \`integer\`, \`int\`), enum sets (\`status:enum{draft|live}\`), and arrays (\`tags:array{string}\`). See the [Fields Shorthand](/docs/cli/fields) reference for the full syntax.

See also [#see-also]

* [Fields Shorthand](/docs/cli/fields) — quick schema syntax reference
* [Installation & Setup](/docs/cli/installation) — getting started
* [Extraction Strategies](/docs/explanation/strategies) — creating strategies
* [Events & Observability](/docs/sdk/events) — progress tracking
`,d={title:"extract()",description:"Main extraction function for the TypeScript SDK."},h={contents:[{heading:"options",content:`<TypeTable
  type="{
  artifacts: {
    description: 'Array of artifacts to extract from',
    type: 'Artifact[]',
    required: true,
  },
  schema: {
    description: 'JSON Schema for output validation (one of schema or fields required)',
    type: 'AnyJSONSchema',
    required: false,
  },
  fields: {
    description: 'Fields shorthand — comma-separated field definitions',
    type: 'string',
    required: false,
  },
  strategy: {
    description: 'A strategy instance',
    type: 'Strategy',
    required: true,
  },
  events: {
    description: 'Event handlers for progress tracking',
    type: 'Events',
    required: false,
  },
}"
/>`},{heading:"options",content:"Exactly one of `schema` or `fields` must be provided. Passing both, or neither, throws immediately."},{heading:"result",content:`<TypeTable
  type="{
  data: {
    description: 'Validated output matching your schema',
    type: 'T',
    required: true,
  },
  usage: {
    description: 'Token counts: inputTokens, outputTokens, totalTokens',
    type: 'Usage',
    required: true,
  },
  error: {
    description: 'Set if extraction encountered a non-fatal error',
    type: 'Error | undefined',
    required: false,
  },
}"
/>`},{heading:"using-fields-instead-of-schema",content:"For quick extractions where you don't need full JSON Schema control, pass a `fields` string:"},{heading:"using-fields-instead-of-schema",content:"`fields` supports scalar types (`string`, `number`/`float`, `boolean`/`bool`, `integer`, `int`), enum sets (`status:enum{draft|live}`), and arrays (`tags:array{string}`). See the Fields Shorthand reference for the full syntax."},{heading:"see-also",content:"Fields Shorthand — quick schema syntax reference"},{heading:"see-also",content:"Installation & Setup — getting started"},{heading:"see-also",content:"Extraction Strategies — creating strategies"},{heading:"see-also",content:"Events & Observability — progress tracking"}],headings:[{id:"usage",content:"Usage"},{id:"options",content:"Options"},{id:"result",content:"Result"},{id:"using-fields-instead-of-schema",content:"Using `fields` instead of `schema`"},{id:"see-also",content:"See also"}]};const o=[{depth:2,url:"#usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:2,url:"#options",title:e.jsx(e.Fragment,{children:"Options"})},{depth:2,url:"#result",title:e.jsx(e.Fragment,{children:"Result"})},{depth:2,url:"#using-fields-instead-of-schema",title:e.jsxs(e.Fragment,{children:["Using ",e.jsx("code",{children:"fields"})," instead of ",e.jsx("code",{children:"schema"})]})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(i){const s={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"usage",children:"Usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, simple } "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ model: "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") }),"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,e.jsx(s.span,{className:"line"}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.data);"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.usage.totalTokens);"})]})]})})}),`
`,e.jsx(s.h2,{id:"options",children:"Options"}),`
`,e.jsx(n,{type:{artifacts:{description:"Array of artifacts to extract from",type:"Artifact[]",required:!0},schema:{description:"JSON Schema for output validation (one of schema or fields required)",type:"AnyJSONSchema",required:!1},fields:{description:"Fields shorthand — comma-separated field definitions",type:"string",required:!1},strategy:{description:"A strategy instance",type:"Strategy",required:!0},events:{description:"Event handlers for progress tracking",type:"Events",required:!1}}}),`
`,e.jsx(r,{type:"warn",children:e.jsxs(s.p,{children:["Exactly one of ",e.jsx(s.code,{children:"schema"})," or ",e.jsx(s.code,{children:"fields"})," must be provided. Passing both, or neither, throws immediately."]})}),`
`,e.jsx(s.h2,{id:"result",children:"Result"}),`
`,e.jsx(n,{type:{data:{description:"Validated output matching your schema",type:"T",required:!0},usage:{description:"Token counts: inputTokens, outputTokens, totalTokens",type:"Usage",required:!0},error:{description:"Set if extraction encountered a non-fatal error",type:"Error | undefined",required:!1}}}),`
`,e.jsxs(s.h2,{id:"using-fields-instead-of-schema",children:["Using ",e.jsx(s.code,{children:"fields"})," instead of ",e.jsx(s.code,{children:"schema"})]}),`
`,e.jsxs(s.p,{children:["For quick extractions where you don't need full JSON Schema control, pass a ",e.jsx(s.code,{children:"fields"})," string:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  fields: "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, author, year:integer, genre:enum{fiction|nonfiction|reference}"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ model: "}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") }),"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"fields"})," supports scalar types (",e.jsx(s.code,{children:"string"}),", ",e.jsx(s.code,{children:"number"}),"/",e.jsx(s.code,{children:"float"}),", ",e.jsx(s.code,{children:"boolean"}),"/",e.jsx(s.code,{children:"bool"}),", ",e.jsx(s.code,{children:"integer"}),", ",e.jsx(s.code,{children:"int"}),"), enum sets (",e.jsx(s.code,{children:"status:enum{draft|live}"}),"), and arrays (",e.jsx(s.code,{children:"tags:array{string}"}),"). See the ",e.jsx(s.a,{href:"/docs/cli/fields",children:"Fields Shorthand"})," reference for the full syntax."]}),`
`,e.jsx(s.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/cli/fields",children:"Fields Shorthand"})," — quick schema syntax reference"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/cli/installation",children:"Installation & Setup"})," — getting started"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/explanation/strategies",children:"Extraction Strategies"})," — creating strategies"]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.a,{href:"/docs/sdk/events",children:"Events & Observability"})," — progress tracking"]}),`
`]})]})}function c(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(t,{...i})}):t(i)}export{l as _markdown,c as default,d as frontmatter,h as structuredData,o as toc};
