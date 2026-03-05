import{j as t}from"./main-CY4pAMb7.js";let a=`

Plain text / markdown (CLI) [#plain-text--markdown-cli]

| Flag              | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| \`--stdin\`         | Reads stdin as UTF-8 text. Auto-detected when piped with no other input flag.                   |
| \`--text <string>\` | Inline text as a CLI argument.                                                                  |
| \`--input <path>\`  | Reads a \`.txt\` or \`.md\` file. If Bun detects MIME type as \`text/*\`, it becomes a text artifact. |

Text is split on double newlines into content slices automatically.

Artifact JSON (CLI) [#artifact-json-cli]

| Flag                     | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| \`--artifact <path\\|->\`   | Reads a pre-built artifact JSON file. Use \`-\` for stdin. |
| \`--artifact-json <json>\` | Inline artifact JSON string.                             |

Both accept a single artifact object or an array.

Schema loading [#schema-loading]

| Flag                   | Description                                      |
| ---------------------- | ------------------------------------------------ |
| \`--schema <path\\|url>\` | JSON Schema file (local path or HTTP/HTTPS URL). |
| \`--schema-json <json>\` | Inline JSON Schema string.                       |

Schema loading from URLs sends \`Accept: application/schema+json, application/json\` headers.

SDK: fileToArtifact(buffer, { mimeType, providers }) [#sdk-filetoartifactbuffer--mimetype-providers-]

Creates an artifact from a Buffer. The provider registry maps MIME types to artifact factories.

If no provider is registered for the MIME type:

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

SDK: urlToArtifact(url) [#sdk-urltoartifacturl]

Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates.

\`\`\`js
import { urlToArtifact } from "@mateffy/struktur";

const artifacts = await urlToArtifact("https://example.com/artifact.json");
\`\`\`

SDK: parseInputToArtifacts(input, options?) [#sdk-parseinputtoartifactsinput-options]

Low-level function that dispatches to the correct parser. Supports:

| Input kind                             | Description                           |
| -------------------------------------- | ------------------------------------- |
| \`{ kind: "text", text }\`               | Text artifact                         |
| \`{ kind: "file", path, mimeType? }\`    | File artifact via provider registry   |
| \`{ kind: "buffer", buffer, mimeType }\` | Buffer artifact via provider registry |
| \`{ kind: "artifact-json", data }\`      | Validates and hydrates                |

Custom parsers can be registered via \`registerArtifactInputParser()\`.

See also [#see-also]

* [The Artifact Format](/docs/explanation/preprocessing/artifact-format) — the JSON spec
* [Artifact Helpers](/docs/sdk/artifact-helpers) — SDK API
* [Writing a Custom Provider](/docs/explanation/preprocessing/custom-provider) — extending MIME type support
`,r={title:"Built-in Input Types",description:"All the ways to get input into Struktur without building a custom provider."},d={contents:[{heading:"plain-text--markdown-cli",content:"Flag"},{heading:"plain-text--markdown-cli",content:"Description"},{heading:"plain-text--markdown-cli",content:"`--stdin`"},{heading:"plain-text--markdown-cli",content:"Reads stdin as UTF-8 text. Auto-detected when piped with no other input flag."},{heading:"plain-text--markdown-cli",content:"`--text <string>`"},{heading:"plain-text--markdown-cli",content:"Inline text as a CLI argument."},{heading:"plain-text--markdown-cli",content:"`--input <path>`"},{heading:"plain-text--markdown-cli",content:"Reads a `.txt` or `.md` file. If Bun detects MIME type as `text/*`, it becomes a text artifact."},{heading:"plain-text--markdown-cli",content:"Text is split on double newlines into content slices automatically."},{heading:"artifact-json-cli",content:"Flag"},{heading:"artifact-json-cli",content:"Description"},{heading:"artifact-json-cli",content:"`--artifact <path\\|->`"},{heading:"artifact-json-cli",content:"Reads a pre-built artifact JSON file. Use `-` for stdin."},{heading:"artifact-json-cli",content:"`--artifact-json <json>`"},{heading:"artifact-json-cli",content:"Inline artifact JSON string."},{heading:"artifact-json-cli",content:"Both accept a single artifact object or an array."},{heading:"schema-loading",content:"Flag"},{heading:"schema-loading",content:"Description"},{heading:"schema-loading",content:"`--schema <path\\|url>`"},{heading:"schema-loading",content:"JSON Schema file (local path or HTTP/HTTPS URL)."},{heading:"schema-loading",content:"`--schema-json <json>`"},{heading:"schema-loading",content:"Inline JSON Schema string."},{heading:"schema-loading",content:"Schema loading from URLs sends `Accept: application/schema+json, application/json` headers."},{heading:"sdk-filetoartifactbuffer--mimetype-providers-",content:"Creates an artifact from a Buffer. The provider registry maps MIME types to artifact factories."},{heading:"sdk-filetoartifactbuffer--mimetype-providers-",content:"If no provider is registered for the MIME type:"},{heading:"sdk-filetoartifactbuffer--mimetype-providers-",content:"`text/*` → text artifact (split on double newlines)"},{heading:"sdk-filetoartifactbuffer--mimetype-providers-",content:"`image/*` → image artifact (single media slice with raw buffer)"},{heading:"sdk-filetoartifactbuffer--mimetype-providers-",content:"Anything else → throws `Unsupported MIME type`"},{heading:"sdk-urltoartifacturl",content:"Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates."},{heading:"sdk-parseinputtoartifactsinput-options",content:"Low-level function that dispatches to the correct parser. Supports:"},{heading:"sdk-parseinputtoartifactsinput-options",content:"Input kind"},{heading:"sdk-parseinputtoartifactsinput-options",content:"Description"},{heading:"sdk-parseinputtoartifactsinput-options",content:'`{ kind: "text", text }`'},{heading:"sdk-parseinputtoartifactsinput-options",content:"Text artifact"},{heading:"sdk-parseinputtoartifactsinput-options",content:'`{ kind: "file", path, mimeType? }`'},{heading:"sdk-parseinputtoartifactsinput-options",content:"File artifact via provider registry"},{heading:"sdk-parseinputtoartifactsinput-options",content:'`{ kind: "buffer", buffer, mimeType }`'},{heading:"sdk-parseinputtoartifactsinput-options",content:"Buffer artifact via provider registry"},{heading:"sdk-parseinputtoartifactsinput-options",content:'`{ kind: "artifact-json", data }`'},{heading:"sdk-parseinputtoartifactsinput-options",content:"Validates and hydrates"},{heading:"sdk-parseinputtoartifactsinput-options",content:"Custom parsers can be registered via `registerArtifactInputParser()`."},{heading:"see-also",content:"The Artifact Format — the JSON spec"},{heading:"see-also",content:"Artifact Helpers — SDK API"},{heading:"see-also",content:"Writing a Custom Provider — extending MIME type support"}],headings:[{id:"plain-text--markdown-cli",content:"Plain text / markdown (CLI)"},{id:"artifact-json-cli",content:"Artifact JSON (CLI)"},{id:"schema-loading",content:"Schema loading"},{id:"sdk-filetoartifactbuffer--mimetype-providers-",content:"SDK: `fileToArtifact(buffer, { mimeType, providers })`"},{id:"sdk-urltoartifacturl",content:"SDK: `urlToArtifact(url)`"},{id:"sdk-parseinputtoartifactsinput-options",content:"SDK: `parseInputToArtifacts(input, options?)`"},{id:"see-also",content:"See also"}]};const c=[{depth:2,url:"#plain-text--markdown-cli",title:t.jsx(t.Fragment,{children:"Plain text / markdown (CLI)"})},{depth:2,url:"#artifact-json-cli",title:t.jsx(t.Fragment,{children:"Artifact JSON (CLI)"})},{depth:2,url:"#schema-loading",title:t.jsx(t.Fragment,{children:"Schema loading"})},{depth:2,url:"#sdk-filetoartifactbuffer--mimetype-providers-",title:t.jsxs(t.Fragment,{children:["SDK: ",t.jsx("code",{children:"fileToArtifact(buffer, { mimeType, providers })"})]})},{depth:2,url:"#sdk-urltoartifacturl",title:t.jsxs(t.Fragment,{children:["SDK: ",t.jsx("code",{children:"urlToArtifact(url)"})]})},{depth:2,url:"#sdk-parseinputtoartifactsinput-options",title:t.jsxs(t.Fragment,{children:["SDK: ",t.jsx("code",{children:"parseInputToArtifacts(input, options?)"})]})},{depth:2,url:"#see-also",title:t.jsx(t.Fragment,{children:"See also"})}];function s(e){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...e.components};return t.jsxs(t.Fragment,{children:[t.jsx(i.h2,{id:"plain-text--markdown-cli",children:"Plain text / markdown (CLI)"}),`
`,t.jsxs(i.table,{children:[t.jsx(i.thead,{children:t.jsxs(i.tr,{children:[t.jsx(i.th,{children:"Flag"}),t.jsx(i.th,{children:"Description"})]})}),t.jsxs(i.tbody,{children:[t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--stdin"})}),t.jsx(i.td,{children:"Reads stdin as UTF-8 text. Auto-detected when piped with no other input flag."})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--text <string>"})}),t.jsx(i.td,{children:"Inline text as a CLI argument."})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--input <path>"})}),t.jsxs(i.td,{children:["Reads a ",t.jsx(i.code,{children:".txt"})," or ",t.jsx(i.code,{children:".md"})," file. If Bun detects MIME type as ",t.jsx(i.code,{children:"text/*"}),", it becomes a text artifact."]})]})]})]}),`
`,t.jsx(i.p,{children:"Text is split on double newlines into content slices automatically."}),`
`,t.jsx(i.h2,{id:"artifact-json-cli",children:"Artifact JSON (CLI)"}),`
`,t.jsxs(i.table,{children:[t.jsx(i.thead,{children:t.jsxs(i.tr,{children:[t.jsx(i.th,{children:"Flag"}),t.jsx(i.th,{children:"Description"})]})}),t.jsxs(i.tbody,{children:[t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--artifact <path|->"})}),t.jsxs(i.td,{children:["Reads a pre-built artifact JSON file. Use ",t.jsx(i.code,{children:"-"})," for stdin."]})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--artifact-json <json>"})}),t.jsx(i.td,{children:"Inline artifact JSON string."})]})]})]}),`
`,t.jsx(i.p,{children:"Both accept a single artifact object or an array."}),`
`,t.jsx(i.h2,{id:"schema-loading",children:"Schema loading"}),`
`,t.jsxs(i.table,{children:[t.jsx(i.thead,{children:t.jsxs(i.tr,{children:[t.jsx(i.th,{children:"Flag"}),t.jsx(i.th,{children:"Description"})]})}),t.jsxs(i.tbody,{children:[t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--schema <path|url>"})}),t.jsx(i.td,{children:"JSON Schema file (local path or HTTP/HTTPS URL)."})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:"--schema-json <json>"})}),t.jsx(i.td,{children:"Inline JSON Schema string."})]})]})]}),`
`,t.jsxs(i.p,{children:["Schema loading from URLs sends ",t.jsx(i.code,{children:"Accept: application/schema+json, application/json"})," headers."]}),`
`,t.jsxs(i.h2,{id:"sdk-filetoartifactbuffer--mimetype-providers-",children:["SDK: ",t.jsx(i.code,{children:"fileToArtifact(buffer, { mimeType, providers })"})]}),`
`,t.jsx(i.p,{children:"Creates an artifact from a Buffer. The provider registry maps MIME types to artifact factories."}),`
`,t.jsx(i.p,{children:"If no provider is registered for the MIME type:"}),`
`,t.jsxs(i.ul,{children:[`
`,t.jsxs(i.li,{children:[t.jsx(i.code,{children:"text/*"})," → text artifact (split on double newlines)"]}),`
`,t.jsxs(i.li,{children:[t.jsx(i.code,{children:"image/*"})," → image artifact (single media slice with raw buffer)"]}),`
`,t.jsxs(i.li,{children:["Anything else → throws ",t.jsx(i.code,{children:"Unsupported MIME type"})]}),`
`]}),`
`,t.jsx(t.Fragment,{children:t.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:t.jsxs(i.code,{children:[t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { fileToArtifact } "}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),t.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs "}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),t.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "node:fs/promises"'}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,t.jsx(i.span,{className:"line"}),`
`,t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),t.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" buffer"}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Buffer."}),t.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"from"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"await"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs."}),t.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"readFile"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),t.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"document.pdf"'}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),t.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifact"}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),t.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" fileToArtifact"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(buffer, {"})]}),`
`,t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  mimeType: "}),t.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"application/pdf"'}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  providers: { "}),t.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* custom providers */"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,t.jsx(i.span,{className:"line",children:t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,t.jsxs(i.h2,{id:"sdk-urltoartifacturl",children:["SDK: ",t.jsx(i.code,{children:"urlToArtifact(url)"})]}),`
`,t.jsx(i.p,{children:"Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates."}),`
`,t.jsx(t.Fragment,{children:t.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:t.jsxs(i.code,{children:[t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { urlToArtifact } "}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),t.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,t.jsx(i.span,{className:"line"}),`
`,t.jsxs(i.span,{className:"line",children:[t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),t.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifacts"}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),t.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),t.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" urlToArtifact"}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),t.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"https://example.com/artifact.json"'}),t.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]})]})})}),`
`,t.jsxs(i.h2,{id:"sdk-parseinputtoartifactsinput-options",children:["SDK: ",t.jsx(i.code,{children:"parseInputToArtifacts(input, options?)"})]}),`
`,t.jsx(i.p,{children:"Low-level function that dispatches to the correct parser. Supports:"}),`
`,t.jsxs(i.table,{children:[t.jsx(i.thead,{children:t.jsxs(i.tr,{children:[t.jsx(i.th,{children:"Input kind"}),t.jsx(i.th,{children:"Description"})]})}),t.jsxs(i.tbody,{children:[t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:'{ kind: "text", text }'})}),t.jsx(i.td,{children:"Text artifact"})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:'{ kind: "file", path, mimeType? }'})}),t.jsx(i.td,{children:"File artifact via provider registry"})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:'{ kind: "buffer", buffer, mimeType }'})}),t.jsx(i.td,{children:"Buffer artifact via provider registry"})]}),t.jsxs(i.tr,{children:[t.jsx(i.td,{children:t.jsx(i.code,{children:'{ kind: "artifact-json", data }'})}),t.jsx(i.td,{children:"Validates and hydrates"})]})]})]}),`
`,t.jsxs(i.p,{children:["Custom parsers can be registered via ",t.jsx(i.code,{children:"registerArtifactInputParser()"}),"."]}),`
`,t.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,t.jsxs(i.ul,{children:[`
`,t.jsxs(i.li,{children:[t.jsx(i.a,{href:"/docs/explanation/preprocessing/artifact-format",children:"The Artifact Format"})," — the JSON spec"]}),`
`,t.jsxs(i.li,{children:[t.jsx(i.a,{href:"/docs/sdk/artifact-helpers",children:"Artifact Helpers"})," — SDK API"]}),`
`,t.jsxs(i.li,{children:[t.jsx(i.a,{href:"/docs/explanation/preprocessing/custom-provider",children:"Writing a Custom Provider"})," — extending MIME type support"]}),`
`]})]})}function l(e={}){const{wrapper:i}=e.components||{};return i?t.jsx(i,{...e,children:t.jsx(s,{...e})}):s(e)}export{a as _markdown,l as default,r as frontmatter,d as structuredData,c as toc};
