import{j as i}from"./main-CY4pAMb7.js";let r=`

\`\`\`bash
struktur verify [--input <path|->]
\`\`\`

| Flag                | Type   | Default | Description                          |
| ------------------- | ------ | ------- | ------------------------------------ |
| \`--input <path\\|->\` | string | stdin   | Artifact JSON file or \`-\` for stdin. |

Output on success:

\`\`\`json
{ "valid": true, "artifacts": 2 }
\`\`\`

Throws with a descriptive error on invalid artifact JSON (schema path, expected type, etc.).

Usage [#usage]

Use this to verify your preprocessing pipeline produces valid artifact format before running extraction.

\`\`\`bash
cat artifacts.json | struktur verify
# or from a file:
struktur verify --input artifacts.json
\`\`\`

See also [#see-also]

* [The Artifact Format](/docs/explanation/preprocessing/artifact-format) — the JSON spec
* [Built-in Input Types](/docs/explanation/preprocessing/built-in-inputs) — creating artifacts
`,a={title:"verify",description:"Validate artifact JSON format."},h={contents:[{heading:void 0,content:"Flag"},{heading:void 0,content:"Type"},{heading:void 0,content:"Default"},{heading:void 0,content:"Description"},{heading:void 0,content:"`--input <path\\|->`"},{heading:void 0,content:"string"},{heading:void 0,content:"stdin"},{heading:void 0,content:"Artifact JSON file or `-` for stdin."},{heading:void 0,content:"Output on success:"},{heading:void 0,content:"Throws with a descriptive error on invalid artifact JSON (schema path, expected type, etc.)."},{heading:"usage",content:"Use this to verify your preprocessing pipeline produces valid artifact format before running extraction."},{heading:"see-also",content:"The Artifact Format — the JSON spec"},{heading:"see-also",content:"Built-in Input Types — creating artifacts"}],headings:[{id:"usage",content:"Usage"},{id:"see-also",content:"See also"}]};const l=[{depth:2,url:"#usage",title:i.jsx(i.Fragment,{children:"Usage"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See also"})}];function t(s){const e={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [--input "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"path"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"|"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"-"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"]"})]})})})}),`
`,i.jsxs(e.table,{children:[i.jsx(e.thead,{children:i.jsxs(e.tr,{children:[i.jsx(e.th,{children:"Flag"}),i.jsx(e.th,{children:"Type"}),i.jsx(e.th,{children:"Default"}),i.jsx(e.th,{children:"Description"})]})}),i.jsx(e.tbody,{children:i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:"--input <path|->"})}),i.jsx(e.td,{children:"string"}),i.jsx(e.td,{children:"stdin"}),i.jsxs(e.td,{children:["Artifact JSON file or ",i.jsx(e.code,{children:"-"})," for stdin."]})]})})]}),`
`,i.jsx(e.p,{children:"Output on success:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsx(e.code,{children:i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{ "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"valid"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"artifacts"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})})})}),`
`,i.jsx(e.p,{children:"Throws with a descriptive error on invalid artifact JSON (schema path, expected type, etc.)."}),`
`,i.jsx(e.h2,{id:"usage",children:"Usage"}),`
`,i.jsx(e.p,{children:"Use this to verify your preprocessing pipeline produces valid artifact format before running extraction."}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or from a file:"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"})]})]})})}),`
`,i.jsx(e.h2,{id:"see-also",children:"See also"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/explanation/preprocessing/artifact-format",children:"The Artifact Format"})," — the JSON spec"]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/explanation/preprocessing/built-in-inputs",children:"Built-in Input Types"})," — creating artifacts"]}),`
`]})]})}function d(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(t,{...s})}):t(s)}export{r as _markdown,d as default,a as frontmatter,h as structuredData,l as toc};
