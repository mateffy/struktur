import{j as i}from"./main-BU_tQzVR.js";let r=`

Synopsis [#synopsis]

\`\`\`bash
struktur verify --input <path>
struktur verify --stdin
\`\`\`

| Flag             | Short | Type    | Description                     |
| ---------------- | ----- | ------- | ------------------------------- |
| \`--input <path>\` | \`-i\`  | string  | Artifact JSON file to validate. |
| \`--stdin\`        | \`-s\`  | boolean | Read artifact JSON from stdin.  |

Output on success:

\`\`\`json
{ "valid": true, "artifacts": 2 }
\`\`\`

Throws with a descriptive error on invalid artifact JSON (schema path, expected type, etc.).

Usage [#usage]

Use this to verify your preprocessing pipeline produces valid artifact format before running extraction.

\`\`\`bash
# From stdin
cat artifacts.json | struktur verify --stdin

# From a file
struktur verify --input artifacts.json

# Verify parse output
struktur parse --input document.pdf | struktur verify --stdin
\`\`\`

See also [#see-also]

* [Artifact Format](/docs/explanation/artifact-format) — the JSON spec
* [parse](/docs/cli/parse) — convert files to artifact JSON
`,a={title:"verify",description:"Validate artifact JSON format."},h={contents:[{heading:"synopsis",content:"Flag"},{heading:"synopsis",content:"Short"},{heading:"synopsis",content:"Type"},{heading:"synopsis",content:"Description"},{heading:"synopsis",content:"`--input <path>`"},{heading:"synopsis",content:"`-i`"},{heading:"synopsis",content:"string"},{heading:"synopsis",content:"Artifact JSON file to validate."},{heading:"synopsis",content:"`--stdin`"},{heading:"synopsis",content:"`-s`"},{heading:"synopsis",content:"boolean"},{heading:"synopsis",content:"Read artifact JSON from stdin."},{heading:"synopsis",content:"Output on success:"},{heading:"synopsis",content:"Throws with a descriptive error on invalid artifact JSON (schema path, expected type, etc.)."},{heading:"usage",content:"Use this to verify your preprocessing pipeline produces valid artifact format before running extraction."},{heading:"see-also",content:"Artifact Format — the JSON spec"},{heading:"see-also",content:"parse — convert files to artifact JSON"}],headings:[{id:"synopsis",content:"Synopsis"},{id:"usage",content:"Usage"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#synopsis",title:i.jsx(i.Fragment,{children:"Synopsis"})},{depth:2,url:"#usage",title:i.jsx(i.Fragment,{children:"Usage"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See also"})}];function t(e){const s={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...e.components};return i.jsxs(i.Fragment,{children:[i.jsx(s.h2,{id:"synopsis",children:"Synopsis"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"pat"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"h"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"})]})]})})}),`
`,i.jsxs(s.table,{children:[i.jsx(s.thead,{children:i.jsxs(s.tr,{children:[i.jsx(s.th,{children:"Flag"}),i.jsx(s.th,{children:"Short"}),i.jsx(s.th,{children:"Type"}),i.jsx(s.th,{children:"Description"})]})}),i.jsxs(s.tbody,{children:[i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"--input <path>"})}),i.jsx(s.td,{children:i.jsx(s.code,{children:"-i"})}),i.jsx(s.td,{children:"string"}),i.jsx(s.td,{children:"Artifact JSON file to validate."})]}),i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"--stdin"})}),i.jsx(s.td,{children:i.jsx(s.code,{children:"-s"})}),i.jsx(s.td,{children:"boolean"}),i.jsx(s.td,{children:"Read artifact JSON from stdin."})]})]})]}),`
`,i.jsx(s.p,{children:"Output on success:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(s.code,{children:i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"valid"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"artifacts"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})})})}),`
`,i.jsx(s.p,{children:"Throws with a descriptive error on invalid artifact JSON (schema path, expected type, etc.)."}),`
`,i.jsx(s.h2,{id:"usage",children:"Usage"}),`
`,i.jsx(s.p,{children:"Use this to verify your preprocessing pipeline produces valid artifact format before running extraction."}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# From stdin"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# From a file"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Verify parse output"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" document.pdf"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"})]})]})})}),`
`,i.jsx(s.h2,{id:"see-also",children:"See also"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/docs/explanation/artifact-format",children:"Artifact Format"})," — the JSON spec"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/docs/cli/parse",children:"parse"})," — convert files to artifact JSON"]}),`
`]})]})}function d(e={}){const{wrapper:s}=e.components||{};return s?i.jsx(s,{...e,children:i.jsx(t,{...e})}):t(e)}export{r as _markdown,d as default,a as frontmatter,h as structuredData,l as toc};
