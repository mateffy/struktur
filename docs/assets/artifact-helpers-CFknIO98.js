import{j as i}from"./main-CY4pAMb7.js";let n=`

fileToArtifact(buffer, options) [#filetoartifactbuffer-options]

Creates an artifact from a Buffer. Resolves the MIME type against the provider registry.

If no provider is registered:

* \`text/*\` → text artifact (split on double newlines)
* \`image/*\` → image artifact (single media slice with raw buffer)
* Anything else → throws \`Unsupported MIME type\`

\`\`\`js
import { fileToArtifact } from "@mateffy/struktur";
import fs from "node:fs/promises";

const buffer = Buffer.from(await fs.readFile("document.pdf"));
const artifact = await fileToArtifact(buffer, {
  mimeType: "application/pdf",
  providers: { /* custom providers */ }
});
\`\`\`

urlToArtifact(url) [#urltoartifacturl]

Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates.

\`\`\`js
import { urlToArtifact } from "@mateffy/struktur";

const artifacts = await urlToArtifact("https://example.com/artifact.json");
\`\`\`

parseInputToArtifacts(input, options?) [#parseinputtoartifactsinput-options]

Low-level dispatcher. Supports:

| Input kind                             | Description                           |
| -------------------------------------- | ------------------------------------- |
| \`{ kind: "text", text }\`               | Text artifact                         |
| \`{ kind: "file", path, mimeType? }\`    | File artifact via provider registry   |
| \`{ kind: "buffer", buffer, mimeType }\` | Buffer artifact via provider registry |
| \`{ kind: "artifact-json", data }\`      | Validates and hydrates                |

\`\`\`js
import { parseInputToArtifacts } from "@mateffy/struktur";

const artifacts = await parseInputToArtifacts(
  { kind: "file", path: "document.pdf" },
  { providers: { "application/pdf": myProvider } }
);
\`\`\`

parseSerializedArtifacts(text) [#parseserializedartifactstext]

Parses a JSON string into artifacts with Ajv validation.

validateSerializedArtifacts(data) [#validateserializedartifactsdata]

Validates an already-parsed value against the artifact schema.

hydrateSerializedArtifacts(items) [#hydrateserializedartifactsitems]

Adds the \`raw()\` function to serialized artifacts.

splitTextIntoContents(text) [#splittextintocontentstext]

Splits a text string on double newlines into content slices.

See also [#see-also]

* [The Artifact Format](/docs/explanation/preprocessing/artifact-format) — JSON spec
* [Built-in Input Types](/docs/explanation/preprocessing/built-in-inputs) — CLI input methods
* [Writing a Custom Provider](/docs/explanation/preprocessing/custom-provider) — extending MIME type support
`,r={title:"Artifact Helpers",description:"Functions to create artifacts from various sources."},l={contents:[{heading:"filetoartifactbuffer-options",content:"Creates an artifact from a Buffer. Resolves the MIME type against the provider registry."},{heading:"filetoartifactbuffer-options",content:"If no provider is registered:"},{heading:"filetoartifactbuffer-options",content:"`text/*` → text artifact (split on double newlines)"},{heading:"filetoartifactbuffer-options",content:"`image/*` → image artifact (single media slice with raw buffer)"},{heading:"filetoartifactbuffer-options",content:"Anything else → throws `Unsupported MIME type`"},{heading:"urltoartifacturl",content:"Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates."},{heading:"parseinputtoartifactsinput-options",content:"Low-level dispatcher. Supports:"},{heading:"parseinputtoartifactsinput-options",content:"Input kind"},{heading:"parseinputtoartifactsinput-options",content:"Description"},{heading:"parseinputtoartifactsinput-options",content:'`{ kind: "text", text }`'},{heading:"parseinputtoartifactsinput-options",content:"Text artifact"},{heading:"parseinputtoartifactsinput-options",content:'`{ kind: "file", path, mimeType? }`'},{heading:"parseinputtoartifactsinput-options",content:"File artifact via provider registry"},{heading:"parseinputtoartifactsinput-options",content:'`{ kind: "buffer", buffer, mimeType }`'},{heading:"parseinputtoartifactsinput-options",content:"Buffer artifact via provider registry"},{heading:"parseinputtoartifactsinput-options",content:'`{ kind: "artifact-json", data }`'},{heading:"parseinputtoartifactsinput-options",content:"Validates and hydrates"},{heading:"parseserializedartifactstext",content:"Parses a JSON string into artifacts with Ajv validation."},{heading:"validateserializedartifactsdata",content:"Validates an already-parsed value against the artifact schema."},{heading:"hydrateserializedartifactsitems",content:"Adds the `raw()` function to serialized artifacts."},{heading:"splittextintocontentstext",content:"Splits a text string on double newlines into content slices."},{heading:"see-also",content:"The Artifact Format — JSON spec"},{heading:"see-also",content:"Built-in Input Types — CLI input methods"},{heading:"see-also",content:"Writing a Custom Provider — extending MIME type support"}],headings:[{id:"filetoartifactbuffer-options",content:"fileToArtifact(buffer, options)"},{id:"urltoartifacturl",content:"urlToArtifact(url)"},{id:"parseinputtoartifactsinput-options",content:"parseInputToArtifacts(input, options?)"},{id:"parseserializedartifactstext",content:"parseSerializedArtifacts(text)"},{id:"validateserializedartifactsdata",content:"validateSerializedArtifacts(data)"},{id:"hydrateserializedartifactsitems",content:"hydrateSerializedArtifacts(items)"},{id:"splittextintocontentstext",content:"splitTextIntoContents(text)"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#filetoartifactbuffer-options",title:i.jsx(i.Fragment,{children:"fileToArtifact(buffer, options)"})},{depth:2,url:"#urltoartifacturl",title:i.jsx(i.Fragment,{children:"urlToArtifact(url)"})},{depth:2,url:"#parseinputtoartifactsinput-options",title:i.jsx(i.Fragment,{children:"parseInputToArtifacts(input, options?)"})},{depth:2,url:"#parseserializedartifactstext",title:i.jsx(i.Fragment,{children:"parseSerializedArtifacts(text)"})},{depth:2,url:"#validateserializedartifactsdata",title:i.jsx(i.Fragment,{children:"validateSerializedArtifacts(data)"})},{depth:2,url:"#hydrateserializedartifactsitems",title:i.jsx(i.Fragment,{children:"hydrateSerializedArtifacts(items)"})},{depth:2,url:"#splittextintocontentstext",title:i.jsx(i.Fragment,{children:"splitTextIntoContents(text)"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See also"})}];function e(s){const t={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(t.h2,{id:"filetoartifactbuffer-options",children:"fileToArtifact(buffer, options)"}),`
`,i.jsx(t.p,{children:"Creates an artifact from a Buffer. Resolves the MIME type against the provider registry."}),`
`,i.jsx(t.p,{children:"If no provider is registered:"}),`
`,i.jsxs(t.ul,{children:[`
`,i.jsxs(t.li,{children:[i.jsx(t.code,{children:"text/*"})," → text artifact (split on double newlines)"]}),`
`,i.jsxs(t.li,{children:[i.jsx(t.code,{children:"image/*"})," → image artifact (single media slice with raw buffer)"]}),`
`,i.jsxs(t.li,{children:["Anything else → throws ",i.jsx(t.code,{children:"Unsupported MIME type"})]}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:i.jsxs(t.code,{children:[i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { fileToArtifact } "}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs "}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "node:fs/promises"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(t.span,{className:"line"}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" buffer"}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Buffer."}),i.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"from"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"await"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs."}),i.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"readFile"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"document.pdf"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifact"}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" fileToArtifact"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(buffer, {"})]}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  mimeType: "}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"application/pdf"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  providers: { "}),i.jsx(t.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* custom providers */"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,i.jsx(t.span,{className:"line",children:i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,i.jsx(t.h2,{id:"urltoartifacturl",children:"urlToArtifact(url)"}),`
`,i.jsx(t.p,{children:"Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates."}),`
`,i.jsx(i.Fragment,{children:i.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:i.jsxs(t.code,{children:[i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { urlToArtifact } "}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(t.span,{className:"line"}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifacts"}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" urlToArtifact"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"https://example.com/artifact.json"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]})]})})}),`
`,i.jsx(t.h2,{id:"parseinputtoartifactsinput-options",children:"parseInputToArtifacts(input, options?)"}),`
`,i.jsx(t.p,{children:"Low-level dispatcher. Supports:"}),`
`,i.jsxs(t.table,{children:[i.jsx(t.thead,{children:i.jsxs(t.tr,{children:[i.jsx(t.th,{children:"Input kind"}),i.jsx(t.th,{children:"Description"})]})}),i.jsxs(t.tbody,{children:[i.jsxs(t.tr,{children:[i.jsx(t.td,{children:i.jsx(t.code,{children:'{ kind: "text", text }'})}),i.jsx(t.td,{children:"Text artifact"})]}),i.jsxs(t.tr,{children:[i.jsx(t.td,{children:i.jsx(t.code,{children:'{ kind: "file", path, mimeType? }'})}),i.jsx(t.td,{children:"File artifact via provider registry"})]}),i.jsxs(t.tr,{children:[i.jsx(t.td,{children:i.jsx(t.code,{children:'{ kind: "buffer", buffer, mimeType }'})}),i.jsx(t.td,{children:"Buffer artifact via provider registry"})]}),i.jsxs(t.tr,{children:[i.jsx(t.td,{children:i.jsx(t.code,{children:'{ kind: "artifact-json", data }'})}),i.jsx(t.td,{children:"Validates and hydrates"})]})]})]}),`
`,i.jsx(i.Fragment,{children:i.jsx(t.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:i.jsxs(t.code,{children:[i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { parseInputToArtifacts } "}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(t.span,{className:"line"}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(t.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifacts"}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(t.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(t.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" parseInputToArtifacts"}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  { kind: "}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"file"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path: "}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"document.pdf"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,i.jsxs(t.span,{className:"line",children:[i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  { providers: { "}),i.jsx(t.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"application/pdf"'}),i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": myProvider } }"})]}),`
`,i.jsx(t.span,{className:"line",children:i.jsx(t.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,i.jsx(t.h2,{id:"parseserializedartifactstext",children:"parseSerializedArtifacts(text)"}),`
`,i.jsx(t.p,{children:"Parses a JSON string into artifacts with Ajv validation."}),`
`,i.jsx(t.h2,{id:"validateserializedartifactsdata",children:"validateSerializedArtifacts(data)"}),`
`,i.jsx(t.p,{children:"Validates an already-parsed value against the artifact schema."}),`
`,i.jsx(t.h2,{id:"hydrateserializedartifactsitems",children:"hydrateSerializedArtifacts(items)"}),`
`,i.jsxs(t.p,{children:["Adds the ",i.jsx(t.code,{children:"raw()"})," function to serialized artifacts."]}),`
`,i.jsx(t.h2,{id:"splittextintocontentstext",children:"splitTextIntoContents(text)"}),`
`,i.jsx(t.p,{children:"Splits a text string on double newlines into content slices."}),`
`,i.jsx(t.h2,{id:"see-also",children:"See also"}),`
`,i.jsxs(t.ul,{children:[`
`,i.jsxs(t.li,{children:[i.jsx(t.a,{href:"/docs/explanation/preprocessing/artifact-format",children:"The Artifact Format"})," — JSON spec"]}),`
`,i.jsxs(t.li,{children:[i.jsx(t.a,{href:"/docs/explanation/preprocessing/built-in-inputs",children:"Built-in Input Types"})," — CLI input methods"]}),`
`,i.jsxs(t.li,{children:[i.jsx(t.a,{href:"/docs/explanation/preprocessing/custom-provider",children:"Writing a Custom Provider"})," — extending MIME type support"]}),`
`]})]})}function d(s={}){const{wrapper:t}=s.components||{};return t?i.jsx(t,{...s,children:i.jsx(e,{...s})}):e(s)}export{n as _markdown,d as default,r as frontmatter,l as structuredData,h as toc};
