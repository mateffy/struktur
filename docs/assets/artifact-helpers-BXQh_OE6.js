import{j as i}from"./main-CqW1cql0.js";let a=`

parse(input, options?) [#parseinput-options]

The primary way to load files and text into artifacts. Handles MIME detection, parser resolution, and PDF image extraction automatically.

\`\`\`typescript
import { parse } from "@mateffy/struktur";

const artifacts = await parse(
  { kind: "file", path: "document.pdf" },
  {
    parserConfig: parsersConfig,   // ParsersConfig — keyed by MIME type
    includeImages: true,           // extract embedded PDF images
    screenshots: false,            // render PDF page screenshots
    screenshotScale: 1.5,          // scale factor for screenshots
    screenshotWidth: undefined,    // target width in pixels (overrides screenshotScale)
  }
);
\`\`\`

Supported input kinds:

| Input kind                             | Description                                                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| \`{ kind: "text", text }\`               | Text artifact (split on double newlines)                                               |
| \`{ kind: "file", path, mimeType? }\`    | File artifact — MIME auto-detected, parser resolved from \`parserConfig\` then built-ins |
| \`{ kind: "buffer", buffer, mimeType }\` | Buffer artifact — parser resolved from \`parserConfig\` then built-ins                   |
| \`{ kind: "artifact-json", data }\`      | Validates and hydrates pre-built artifact JSON                                         |

fileToArtifact(buffer, options) [#filetoartifactbuffer-options]

Lower-level helper that creates an artifact from a Buffer. **Deprecated:** use \`parse()\` with \`InlineParserDef\` in \`parserConfig\` instead.

**Important:** \`fileToArtifact\` uses the legacy \`providers\` registry, which does not include the built-in PDF parser or any parsers configured via \`config parsers add\`. For PDF and other format support, use \`parse\` instead.

If no provider is registered for the MIME type:

* \`text/*\` → text artifact (split on double newlines)
* \`image/*\` → image artifact (single media slice)
* Anything else → throws \`Unsupported MIME type\`

\`\`\`js
import { fileToArtifact } from "@mateffy/struktur";
import fs from "node:fs/promises";

const buffer = Buffer.from(await fs.readFile("document.txt"));
const artifact = await fileToArtifact(buffer, {
  mimeType: "text/plain",
  providers: { /* deprecated — use parserConfig with InlineParserDef instead */ }
});
\`\`\`

urlToArtifact(url) [#urltoartifacturl]

Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates.

\`\`\`js
import { urlToArtifact } from "@mateffy/struktur";

const artifacts = await urlToArtifact("https://example.com/artifact.json");
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
* [Parsers](/docs/explanation/parsers) — how files are converted to artifacts
* [Custom Parser](/docs/explanation/preprocessing/custom-provider) — extending the parser system
`,r={title:"Artifact Helpers",description:"Functions to create artifacts from various sources."},l={contents:[{heading:"parseinput-options",content:"The primary way to load files and text into artifacts. Handles MIME detection, parser resolution, and PDF image extraction automatically."},{heading:"parseinput-options",content:"Supported input kinds:"},{heading:"parseinput-options",content:"Input kind"},{heading:"parseinput-options",content:"Description"},{heading:"parseinput-options",content:'`{ kind: "text", text }`'},{heading:"parseinput-options",content:"Text artifact (split on double newlines)"},{heading:"parseinput-options",content:'`{ kind: "file", path, mimeType? }`'},{heading:"parseinput-options",content:"File artifact — MIME auto-detected, parser resolved from `parserConfig` then built-ins"},{heading:"parseinput-options",content:'`{ kind: "buffer", buffer, mimeType }`'},{heading:"parseinput-options",content:"Buffer artifact — parser resolved from `parserConfig` then built-ins"},{heading:"parseinput-options",content:'`{ kind: "artifact-json", data }`'},{heading:"parseinput-options",content:"Validates and hydrates pre-built artifact JSON"},{heading:"filetoartifactbuffer-options",content:"Lower-level helper that creates an artifact from a Buffer. &#x2A;*Deprecated:** use `parse()` with `InlineParserDef` in `parserConfig` instead."},{heading:"filetoartifactbuffer-options",content:"**Important:** `fileToArtifact` uses the legacy `providers` registry, which does not include the built-in PDF parser or any parsers configured via `config parsers add`. For PDF and other format support, use `parse` instead."},{heading:"filetoartifactbuffer-options",content:"If no provider is registered for the MIME type:"},{heading:"filetoartifactbuffer-options",content:"`text/*` → text artifact (split on double newlines)"},{heading:"filetoartifactbuffer-options",content:"`image/*` → image artifact (single media slice)"},{heading:"filetoartifactbuffer-options",content:"Anything else → throws `Unsupported MIME type`"},{heading:"urltoartifacturl",content:"Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates."},{heading:"parseserializedartifactstext",content:"Parses a JSON string into artifacts with Ajv validation."},{heading:"validateserializedartifactsdata",content:"Validates an already-parsed value against the artifact schema."},{heading:"hydrateserializedartifactsitems",content:"Adds the `raw()` function to serialized artifacts."},{heading:"splittextintocontentstext",content:"Splits a text string on double newlines into content slices."},{heading:"see-also",content:"The Artifact Format — JSON spec"},{heading:"see-also",content:"Built-in Input Types — CLI input methods"},{heading:"see-also",content:"Parsers — how files are converted to artifacts"},{heading:"see-also",content:"Custom Parser — extending the parser system"}],headings:[{id:"parseinput-options",content:"parse(input, options?)"},{id:"filetoartifactbuffer-options",content:"fileToArtifact(buffer, options)"},{id:"urltoartifacturl",content:"urlToArtifact(url)"},{id:"parseserializedartifactstext",content:"parseSerializedArtifacts(text)"},{id:"validateserializedartifactsdata",content:"validateSerializedArtifacts(data)"},{id:"hydrateserializedartifactsitems",content:"hydrateSerializedArtifacts(items)"},{id:"splittextintocontentstext",content:"splitTextIntoContents(text)"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#parseinput-options",title:i.jsx(i.Fragment,{children:"parse(input, options?)"})},{depth:2,url:"#filetoartifactbuffer-options",title:i.jsx(i.Fragment,{children:"fileToArtifact(buffer, options)"})},{depth:2,url:"#urltoartifacturl",title:i.jsx(i.Fragment,{children:"urlToArtifact(url)"})},{depth:2,url:"#parseserializedartifactstext",title:i.jsx(i.Fragment,{children:"parseSerializedArtifacts(text)"})},{depth:2,url:"#validateserializedartifactsdata",title:i.jsx(i.Fragment,{children:"validateSerializedArtifacts(data)"})},{depth:2,url:"#hydrateserializedartifactsitems",title:i.jsx(i.Fragment,{children:"hydrateSerializedArtifacts(items)"})},{depth:2,url:"#splittextintocontentstext",title:i.jsx(i.Fragment,{children:"splitTextIntoContents(text)"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See also"})}];function t(s){const e={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return i.jsxs(i.Fragment,{children:[i.jsx(e.h2,{id:"parseinput-options",children:"parse(input, options?)"}),`
`,i.jsx(e.p,{children:"The primary way to load files and text into artifacts. Handles MIME detection, parser resolution, and PDF image extraction automatically."}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { parse } "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifacts"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" parse"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  { kind: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"file"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", path: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"document.pdf"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  {"})}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    parserConfig: parsersConfig,   "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ParsersConfig — keyed by MIME type"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    includeImages: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"true"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",           "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// extract embedded PDF images"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    screenshots: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",            "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// render PDF page screenshots"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    screenshotScale: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1.5"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",          "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// scale factor for screenshots"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    screenshotWidth: "}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"undefined"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:",    "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// target width in pixels (overrides screenshotScale)"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})})]})})}),`
`,i.jsx(e.p,{children:"Supported input kinds:"}),`
`,i.jsxs(e.table,{children:[i.jsx(e.thead,{children:i.jsxs(e.tr,{children:[i.jsx(e.th,{children:"Input kind"}),i.jsx(e.th,{children:"Description"})]})}),i.jsxs(e.tbody,{children:[i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:'{ kind: "text", text }'})}),i.jsx(e.td,{children:"Text artifact (split on double newlines)"})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:'{ kind: "file", path, mimeType? }'})}),i.jsxs(e.td,{children:["File artifact — MIME auto-detected, parser resolved from ",i.jsx(e.code,{children:"parserConfig"})," then built-ins"]})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:'{ kind: "buffer", buffer, mimeType }'})}),i.jsxs(e.td,{children:["Buffer artifact — parser resolved from ",i.jsx(e.code,{children:"parserConfig"})," then built-ins"]})]}),i.jsxs(e.tr,{children:[i.jsx(e.td,{children:i.jsx(e.code,{children:'{ kind: "artifact-json", data }'})}),i.jsx(e.td,{children:"Validates and hydrates pre-built artifact JSON"})]})]})]}),`
`,i.jsx(e.h2,{id:"filetoartifactbuffer-options",children:"fileToArtifact(buffer, options)"}),`
`,i.jsxs(e.p,{children:["Lower-level helper that creates an artifact from a Buffer. ",i.jsx(e.strong,{children:"Deprecated:"})," use ",i.jsx(e.code,{children:"parse()"})," with ",i.jsx(e.code,{children:"InlineParserDef"})," in ",i.jsx(e.code,{children:"parserConfig"})," instead."]}),`
`,i.jsxs(e.p,{children:[i.jsx(e.strong,{children:"Important:"})," ",i.jsx(e.code,{children:"fileToArtifact"})," uses the legacy ",i.jsx(e.code,{children:"providers"})," registry, which does not include the built-in PDF parser or any parsers configured via ",i.jsx(e.code,{children:"config parsers add"}),". For PDF and other format support, use ",i.jsx(e.code,{children:"parse"})," instead."]}),`
`,i.jsx(e.p,{children:"If no provider is registered for the MIME type:"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"text/*"})," → text artifact (split on double newlines)"]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.code,{children:"image/*"})," → image artifact (single media slice)"]}),`
`,i.jsxs(e.li,{children:["Anything else → throws ",i.jsx(e.code,{children:"Unsupported MIME type"})]}),`
`]}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { fileToArtifact } "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "node:fs/promises"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" buffer"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" Buffer."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"await"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" fs."}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"readFile"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"document.txt"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifact"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" fileToArtifact"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(buffer, {"})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  mimeType: "}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"text/plain"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  providers: { "}),i.jsx(e.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"/* deprecated — use parserConfig with InlineParserDef instead */"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,i.jsx(e.span,{className:"line",children:i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,i.jsx(e.h2,{id:"urltoartifacturl",children:"urlToArtifact(url)"}),`
`,i.jsx(e.p,{children:"Fetches a URL and expects it to return pre-serialized artifact JSON. Validates and hydrates."}),`
`,i.jsx(i.Fragment,{children:i.jsx(e.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:i.jsxs(e.code,{children:[i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { urlToArtifact } "}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(e.span,{className:"line"}),`
`,i.jsxs(e.span,{className:"line",children:[i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),i.jsx(e.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" artifacts"}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),i.jsx(e.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),i.jsx(e.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" urlToArtifact"}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(e.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"https://example.com/artifact.json"'}),i.jsx(e.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]})]})})}),`
`,i.jsx(e.h2,{id:"parseserializedartifactstext",children:"parseSerializedArtifacts(text)"}),`
`,i.jsx(e.p,{children:"Parses a JSON string into artifacts with Ajv validation."}),`
`,i.jsx(e.h2,{id:"validateserializedartifactsdata",children:"validateSerializedArtifacts(data)"}),`
`,i.jsx(e.p,{children:"Validates an already-parsed value against the artifact schema."}),`
`,i.jsx(e.h2,{id:"hydrateserializedartifactsitems",children:"hydrateSerializedArtifacts(items)"}),`
`,i.jsxs(e.p,{children:["Adds the ",i.jsx(e.code,{children:"raw()"})," function to serialized artifacts."]}),`
`,i.jsx(e.h2,{id:"splittextintocontentstext",children:"splitTextIntoContents(text)"}),`
`,i.jsx(e.p,{children:"Splits a text string on double newlines into content slices."}),`
`,i.jsx(e.h2,{id:"see-also",children:"See also"}),`
`,i.jsxs(e.ul,{children:[`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/explanation/preprocessing/artifact-format",children:"The Artifact Format"})," — JSON spec"]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/explanation/preprocessing/built-in-inputs",children:"Built-in Input Types"})," — CLI input methods"]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/explanation/parsers",children:"Parsers"})," — how files are converted to artifacts"]}),`
`,i.jsxs(e.li,{children:[i.jsx(e.a,{href:"/docs/explanation/preprocessing/custom-provider",children:"Custom Parser"})," — extending the parser system"]}),`
`]})]})}function d(s={}){const{wrapper:e}=s.components||{};return e?i.jsx(e,{...s,children:i.jsx(t,{...s})}):t(s)}export{a as _markdown,d as default,r as frontmatter,l as structuredData,h as toc};
