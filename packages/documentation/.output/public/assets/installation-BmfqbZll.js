import{j as s}from"./main-BqAtuq49.js";let a=`

\`\`\`bash
npm install @struktur/sdk
# or
bun add @struktur/sdk
\`\`\`

Peer dependency: \`typescript ^5\`.

The package exports all types, functions, and strategy factories from the entrypoint. The \`@ai-sdk/anthropic\`, \`@ai-sdk/google\`, \`@ai-sdk/openai\`, and \`@openrouter/ai-sdk-provider\` packages are bundled as dependencies — you do not need to install them separately.

* [npm: @struktur/sdk](https://www.npmjs.com/package/@struktur/sdk)
* [GitHub: packages/sdk](https://github.com/mateffy/struktur/tree/main/packages/sdk)

Exports [#exports]

\`\`\`js
// Main function
import { extract } from "@struktur/sdk";

// Strategy factories
import { simple, parallel, sequential, parallelAutoMerge, sequentialAutoMerge, doublePass, doublePassAutoMerge } from "@struktur/sdk";

// Artifact helpers
import { parse, fileToArtifact, urlToArtifact } from "@struktur/sdk";
\`\`\`

See also [#see-also]

* [extract()](/docs/sdk/extract) — main extraction function
* [parse()](/docs/sdk/parse) — creating artifacts
`,r={title:"Installation",description:"Install the Struktur TypeScript SDK."},l={contents:[{heading:void 0,content:"Peer dependency: `typescript ^5`."},{heading:void 0,content:"The package exports all types, functions, and strategy factories from the entrypoint. The `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/openai`, and `@openrouter/ai-sdk-provider` packages are bundled as dependencies — you do not need to install them separately."},{heading:void 0,content:"npm: @struktur/sdk"},{heading:void 0,content:"GitHub: packages/sdk"},{heading:"see-also",content:"extract() — main extraction function"},{heading:"see-also",content:"parse() — creating artifacts"}],headings:[{id:"exports",content:"Exports"},{id:"see-also",content:"See also"}]};const d=[{depth:2,url:"#exports",title:s.jsx(s.Fragment,{children:"Exports"})},{depth:2,url:"#see-also",title:s.jsx(s.Fragment,{children:"See also"})}];function n(i){const e={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return s.jsxs(s.Fragment,{children:[s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/sdk"})]}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" @struktur/sdk"})]})]})})}),`
`,s.jsxs(e.p,{children:["Peer dependency: ",s.jsx(e.code,{children:"typescript ^5"}),"."]}),`
`,s.jsxs(e.p,{children:["The package exports all types, functions, and strategy factories from the entrypoint. The ",s.jsx(e.code,{children:"@ai-sdk/anthropic"}),", ",s.jsx(e.code,{children:"@ai-sdk/google"}),", ",s.jsx(e.code,{children:"@ai-sdk/openai"}),", and ",s.jsx(e.code,{children:"@openrouter/ai-sdk-provider"})," packages are bundled as dependencies — you do not need to install them separately."]}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:s.jsx(e.a,{href:"https://www.npmjs.com/package/@struktur/sdk",children:"npm: @struktur/sdk"})}),`
`,s.jsx(e.li,{children:s.jsx(e.a,{href:"https://github.com/mateffy/struktur/tree/main/packages/sdk",children:"GitHub: packages/sdk"})}),`
`]}),`
`,s.jsx(e.h2,{id:"exports",children:"Exports"}),`
`,s.jsx(s.Fragment,{children:s.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:s.jsxs(e.code,{children:[s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Main function"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Strategy factories"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { simple, parallel, sequential, parallelAutoMerge, sequentialAutoMerge, doublePass, doublePassAutoMerge } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,s.jsx(e.span,{className:"line"}),`
`,s.jsx(e.span,{className:"line",children:s.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Artifact helpers"})}),`
`,s.jsxs(e.span,{className:"line",children:[s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { parse, fileToArtifact, urlToArtifact } "}),s.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),s.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),s.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,s.jsx(e.h2,{id:"see-also",children:"See also"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/docs/sdk/extract",children:"extract()"})," — main extraction function"]}),`
`,s.jsxs(e.li,{children:[s.jsx(e.a,{href:"/docs/sdk/parse",children:"parse()"})," — creating artifacts"]}),`
`]})]})}function h(i={}){const{wrapper:e}=i.components||{};return e?s.jsx(e,{...i,children:s.jsx(n,{...i})}):n(i)}export{a as _markdown,h as default,r as frontmatter,l as structuredData,d as toc};
