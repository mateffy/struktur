import{j as e}from"./main-PqBd4K9d.js";let a=`

The normalization boundary [#the-normalization-boundary]

Different document types (PDF, HTML, Excel, email) require different parsing strategies. But LLM extraction is the same regardless of source format. The Artifact is the normalized form that crosses that boundary.

Struktur only cares about what is in the artifact, not where it came from.

What an artifact contains [#what-an-artifact-contains]

An artifact has:

* \`id\`: unique identifier
* \`type\`: type hint (\`text\`, \`image\`, \`pdf\`, \`file\`)
* \`contents\`: a sequence of content slices

Each content slice may have:

* \`text\`: the text content
* \`page\`: page number (for paginated documents)
* \`media\`: embedded images

This structure naturally maps to paginated documents (each page is a content slice) or segmented text (each paragraph/section is a slice).

Why text + images together? [#why-text--images-together]

Some documents (real estate exposés, product datasheets) have critical information in images. Because images are embedded directly in content slices alongside text, the LLM sees them in context.

Image limits per chunk are configurable on parallel strategies via \`maxImages\`.

Complete specification [#complete-specification]

Top-level shape [#top-level-shape]

| Field      | Required | Description                            |
| ---------- | -------- | -------------------------------------- |
| \`id\`       | Yes      | Unique identifier                      |
| \`type\`     | Yes      | One of: \`text\`, \`image\`, \`pdf\`, \`file\` |
| \`contents\` | Yes      | Array of content slices (at least one) |
| \`metadata\` | No       | Pass-through metadata object           |
| \`tokens\`   | No       | Pre-computed token count hint          |

Accepted as: a single object or an array \`[{...}, {...}]\`.

Content slices [#content-slices]

Each item in \`contents\` has:

| Field   | Required | Description                            |
| ------- | -------- | -------------------------------------- |
| \`page\`  | No       | Page number for paginated documents    |
| \`text\`  | No       | Text content of this slice             |
| \`media\` | No       | Array of images embedded in this slice |

At least one of \`text\` or \`media\` must be present.

Images [#images]

Each item in \`media\` has:

| Field                       | Required | Description                                                                                                                               |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| \`type\`                      | Yes      | Must be \`"image"\`                                                                                                                         |
| \`url\`                       | No       | URL to image (mutually exclusive with \`base64\`)                                                                                           |
| \`base64\`                    | No       | Base64-encoded image data (no data-URL prefix)                                                                                            |
| \`text\`                      | No       | Alt text or OCR output                                                                                                                    |
| \`x\`, \`y\`, \`width\`, \`height\` | No       | Optional spatial metadata (pixels)                                                                                                        |
| \`imageType\`                 | No       | \`"embedded"\` or \`"screenshot"\`. Distinguishes images extracted from the document body from page renders. Omit for hand-crafted artifacts. |

Either \`url\` or \`base64\` must be present.

The \`imageType\` field is set automatically by the PDF parser: \`"embedded"\` for images extracted from the PDF body (requires \`--images\`), \`"screenshot"\` for full-page renders (requires \`--screenshots\`). The artifact viewer uses this field to filter and badge images independently.

Complete example [#complete-example]

\`\`\`json
[
  {
    "id": "invoice-2024-1042",
    "type": "pdf",
    "contents": [
      {
        "page": 1,
        "text": "INVOICE\\nInvoice #: 1042\\nDate: 2024-03-01\\nBill To: Acme Corp\\n...",
        "media": [
          {
            "type": "image",
            "base64": "iVBORw0KGgoAAAANS...",
            "text": "Company logo",
            "imageType": "embedded"
          },
          {
            "type": "image",
            "base64": "iVBORw0KGgoAAAANS...",
            "imageType": "screenshot"
          }
        ]
      },
      {
        "page": 2,
        "text": "Line Items:\\n- Widget A x10 @ $50.00 = $500.00\\n- Widget B x5 @ $200.00 = $1,000.00\\nTotal: $1,500.00"
      }
    ],
    "metadata": {
      "filename": "invoice-1042.pdf",
      "source": "email-attachment"
    }
  }
]
\`\`\`

Validation [#validation]

Struktur validates artifact JSON before processing. Use the CLI:

\`\`\`bash
# From stdin
cat artifacts.json | struktur verify --stdin
# or from a file:
struktur verify --input artifacts.json
\`\`\`

Returns \`{ "valid": true, "artifacts": 1 }\` on success, throws with error detail on failure.

Built-in artifact creation [#built-in-artifact-creation]

| Path                    | Description                                                                       |
| ----------------------- | --------------------------------------------------------------------------------- |
| \`--input <file>\` (CLI)  | MIME detection + parser resolution; PDF uses built-in \`parsePdf\`                  |
| \`--stdin\` (CLI)         | MIME detection on buffer; \`text/plain\` falls back to text artifact                |
| \`parse()\` (SDK)         | Accepts \`kind: "text"\`, \`kind: "file"\`, \`kind: "buffer"\`, \`kind: "artifact-json"\` |
| \`urlToArtifact()\` (SDK) | Fetches URL, validates as \`SerializedArtifact[]\`                                  |

See also [#see-also]

* [Built-in Input Types](/docs/explanation/preprocessing/built-in-inputs) — how to get input into Struktur
* [Artifact Helpers](/docs/sdk/artifact-helpers) — the SDK API
* [Parsers](/docs/explanation/parsers) — how files are converted to artifacts
`,h={title:"Artifact Format",description:"The artifact abstraction and complete specification."},l={contents:[{heading:"the-normalization-boundary",content:"Different document types (PDF, HTML, Excel, email) require different parsing strategies. But LLM extraction is the same regardless of source format. The Artifact is the normalized form that crosses that boundary."},{heading:"the-normalization-boundary",content:"Struktur only cares about what is in the artifact, not where it came from."},{heading:"what-an-artifact-contains",content:"An artifact has:"},{heading:"what-an-artifact-contains",content:"`id`: unique identifier"},{heading:"what-an-artifact-contains",content:"`type`: type hint (`text`, `image`, `pdf`, `file`)"},{heading:"what-an-artifact-contains",content:"`contents`: a sequence of content slices"},{heading:"what-an-artifact-contains",content:"Each content slice may have:"},{heading:"what-an-artifact-contains",content:"`text`: the text content"},{heading:"what-an-artifact-contains",content:"`page`: page number (for paginated documents)"},{heading:"what-an-artifact-contains",content:"`media`: embedded images"},{heading:"what-an-artifact-contains",content:"This structure naturally maps to paginated documents (each page is a content slice) or segmented text (each paragraph/section is a slice)."},{heading:"why-text--images-together",content:"Some documents (real estate exposés, product datasheets) have critical information in images. Because images are embedded directly in content slices alongside text, the LLM sees them in context."},{heading:"why-text--images-together",content:"Image limits per chunk are configurable on parallel strategies via `maxImages`."},{heading:"top-level-shape",content:"Field"},{heading:"top-level-shape",content:"Required"},{heading:"top-level-shape",content:"Description"},{heading:"top-level-shape",content:"`id`"},{heading:"top-level-shape",content:"Yes"},{heading:"top-level-shape",content:"Unique identifier"},{heading:"top-level-shape",content:"`type`"},{heading:"top-level-shape",content:"Yes"},{heading:"top-level-shape",content:"One of: `text`, `image`, `pdf`, `file`"},{heading:"top-level-shape",content:"`contents`"},{heading:"top-level-shape",content:"Yes"},{heading:"top-level-shape",content:"Array of content slices (at least one)"},{heading:"top-level-shape",content:"`metadata`"},{heading:"top-level-shape",content:"No"},{heading:"top-level-shape",content:"Pass-through metadata object"},{heading:"top-level-shape",content:"`tokens`"},{heading:"top-level-shape",content:"No"},{heading:"top-level-shape",content:"Pre-computed token count hint"},{heading:"top-level-shape",content:"Accepted as: a single object or an array `[{...}, {...}]`."},{heading:"content-slices",content:"Each item in `contents` has:"},{heading:"content-slices",content:"Field"},{heading:"content-slices",content:"Required"},{heading:"content-slices",content:"Description"},{heading:"content-slices",content:"`page`"},{heading:"content-slices",content:"No"},{heading:"content-slices",content:"Page number for paginated documents"},{heading:"content-slices",content:"`text`"},{heading:"content-slices",content:"No"},{heading:"content-slices",content:"Text content of this slice"},{heading:"content-slices",content:"`media`"},{heading:"content-slices",content:"No"},{heading:"content-slices",content:"Array of images embedded in this slice"},{heading:"content-slices",content:"At least one of `text` or `media` must be present."},{heading:"images",content:"Each item in `media` has:"},{heading:"images",content:"Field"},{heading:"images",content:"Required"},{heading:"images",content:"Description"},{heading:"images",content:"`type`"},{heading:"images",content:"Yes"},{heading:"images",content:'Must be `"image"`'},{heading:"images",content:"`url`"},{heading:"images",content:"No"},{heading:"images",content:"URL to image (mutually exclusive with `base64`)"},{heading:"images",content:"`base64`"},{heading:"images",content:"No"},{heading:"images",content:"Base64-encoded image data (no data-URL prefix)"},{heading:"images",content:"`text`"},{heading:"images",content:"No"},{heading:"images",content:"Alt text or OCR output"},{heading:"images",content:"`x`, `y`, `width`, `height`"},{heading:"images",content:"No"},{heading:"images",content:"Optional spatial metadata (pixels)"},{heading:"images",content:"`imageType`"},{heading:"images",content:"No"},{heading:"images",content:'`"embedded"` or `"screenshot"`. Distinguishes images extracted from the document body from page renders. Omit for hand-crafted artifacts.'},{heading:"images",content:"Either `url` or `base64` must be present."},{heading:"images",content:'The `imageType` field is set automatically by the PDF parser: `"embedded"` for images extracted from the PDF body (requires `--images`), `"screenshot"` for full-page renders (requires `--screenshots`). The artifact viewer uses this field to filter and badge images independently.'},{heading:"validation",content:"Struktur validates artifact JSON before processing. Use the CLI:"},{heading:"validation",content:'Returns `{ "valid": true, "artifacts": 1 }` on success, throws with error detail on failure.'},{heading:"built-in-artifact-creation",content:"Path"},{heading:"built-in-artifact-creation",content:"Description"},{heading:"built-in-artifact-creation",content:"`--input <file>` (CLI)"},{heading:"built-in-artifact-creation",content:"MIME detection + parser resolution; PDF uses built-in `parsePdf`"},{heading:"built-in-artifact-creation",content:"`--stdin` (CLI)"},{heading:"built-in-artifact-creation",content:"MIME detection on buffer; `text/plain` falls back to text artifact"},{heading:"built-in-artifact-creation",content:"`parse()` (SDK)"},{heading:"built-in-artifact-creation",content:'Accepts `kind: "text"`, `kind: "file"`, `kind: "buffer"`, `kind: "artifact-json"`'},{heading:"built-in-artifact-creation",content:"`urlToArtifact()` (SDK)"},{heading:"built-in-artifact-creation",content:"Fetches URL, validates as `SerializedArtifact[]`"},{heading:"see-also",content:"Built-in Input Types — how to get input into Struktur"},{heading:"see-also",content:"Artifact Helpers — the SDK API"},{heading:"see-also",content:"Parsers — how files are converted to artifacts"}],headings:[{id:"the-normalization-boundary",content:"The normalization boundary"},{id:"what-an-artifact-contains",content:"What an artifact contains"},{id:"why-text--images-together",content:"Why text + images together?"},{id:"complete-specification",content:"Complete specification"},{id:"top-level-shape",content:"Top-level shape"},{id:"content-slices",content:"Content slices"},{id:"images",content:"Images"},{id:"complete-example",content:"Complete example"},{id:"validation",content:"Validation"},{id:"built-in-artifact-creation",content:"Built-in artifact creation"},{id:"see-also",content:"See also"}]};const r=[{depth:2,url:"#the-normalization-boundary",title:e.jsx(e.Fragment,{children:"The normalization boundary"})},{depth:2,url:"#what-an-artifact-contains",title:e.jsx(e.Fragment,{children:"What an artifact contains"})},{depth:2,url:"#why-text--images-together",title:e.jsx(e.Fragment,{children:"Why text + images together?"})},{depth:2,url:"#complete-specification",title:e.jsx(e.Fragment,{children:"Complete specification"})},{depth:3,url:"#top-level-shape",title:e.jsx(e.Fragment,{children:"Top-level shape"})},{depth:3,url:"#content-slices",title:e.jsx(e.Fragment,{children:"Content slices"})},{depth:3,url:"#images",title:e.jsx(e.Fragment,{children:"Images"})},{depth:3,url:"#complete-example",title:e.jsx(e.Fragment,{children:"Complete example"})},{depth:2,url:"#validation",title:e.jsx(e.Fragment,{children:"Validation"})},{depth:2,url:"#built-in-artifact-creation",title:e.jsx(e.Fragment,{children:"Built-in artifact creation"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function n(t){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"the-normalization-boundary",children:"The normalization boundary"}),`
`,e.jsx(i.p,{children:"Different document types (PDF, HTML, Excel, email) require different parsing strategies. But LLM extraction is the same regardless of source format. The Artifact is the normalized form that crosses that boundary."}),`
`,e.jsx(i.p,{children:"Struktur only cares about what is in the artifact, not where it came from."}),`
`,e.jsx(i.h2,{id:"what-an-artifact-contains",children:"What an artifact contains"}),`
`,e.jsx(i.p,{children:"An artifact has:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"id"}),": unique identifier"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"type"}),": type hint (",e.jsx(i.code,{children:"text"}),", ",e.jsx(i.code,{children:"image"}),", ",e.jsx(i.code,{children:"pdf"}),", ",e.jsx(i.code,{children:"file"}),")"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"contents"}),": a sequence of content slices"]}),`
`]}),`
`,e.jsx(i.p,{children:"Each content slice may have:"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"text"}),": the text content"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"page"}),": page number (for paginated documents)"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"media"}),": embedded images"]}),`
`]}),`
`,e.jsx(i.p,{children:"This structure naturally maps to paginated documents (each page is a content slice) or segmented text (each paragraph/section is a slice)."}),`
`,e.jsx(i.h2,{id:"why-text--images-together",children:"Why text + images together?"}),`
`,e.jsx(i.p,{children:"Some documents (real estate exposés, product datasheets) have critical information in images. Because images are embedded directly in content slices alongside text, the LLM sees them in context."}),`
`,e.jsxs(i.p,{children:["Image limits per chunk are configurable on parallel strategies via ",e.jsx(i.code,{children:"maxImages"}),"."]}),`
`,e.jsx(i.h2,{id:"complete-specification",children:"Complete specification"}),`
`,e.jsx(i.h3,{id:"top-level-shape",children:"Top-level shape"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"id"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"Unique identifier"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"type"})}),e.jsx(i.td,{children:"Yes"}),e.jsxs(i.td,{children:["One of: ",e.jsx(i.code,{children:"text"}),", ",e.jsx(i.code,{children:"image"}),", ",e.jsx(i.code,{children:"pdf"}),", ",e.jsx(i.code,{children:"file"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"contents"})}),e.jsx(i.td,{children:"Yes"}),e.jsx(i.td,{children:"Array of content slices (at least one)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"metadata"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Pass-through metadata object"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"tokens"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Pre-computed token count hint"})]})]})]}),`
`,e.jsxs(i.p,{children:["Accepted as: a single object or an array ",e.jsx(i.code,{children:"[{...}, {...}]"}),"."]}),`
`,e.jsx(i.h3,{id:"content-slices",children:"Content slices"}),`
`,e.jsxs(i.p,{children:["Each item in ",e.jsx(i.code,{children:"contents"})," has:"]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"page"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Page number for paginated documents"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"text"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Text content of this slice"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"media"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Array of images embedded in this slice"})]})]})]}),`
`,e.jsxs(i.p,{children:["At least one of ",e.jsx(i.code,{children:"text"})," or ",e.jsx(i.code,{children:"media"})," must be present."]}),`
`,e.jsx(i.h3,{id:"images",children:"Images"}),`
`,e.jsxs(i.p,{children:["Each item in ",e.jsx(i.code,{children:"media"})," has:"]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Field"}),e.jsx(i.th,{children:"Required"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"type"})}),e.jsx(i.td,{children:"Yes"}),e.jsxs(i.td,{children:["Must be ",e.jsx(i.code,{children:'"image"'})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"url"})}),e.jsx(i.td,{children:"No"}),e.jsxs(i.td,{children:["URL to image (mutually exclusive with ",e.jsx(i.code,{children:"base64"}),")"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"base64"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Base64-encoded image data (no data-URL prefix)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"text"})}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Alt text or OCR output"})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"x"}),", ",e.jsx(i.code,{children:"y"}),", ",e.jsx(i.code,{children:"width"}),", ",e.jsx(i.code,{children:"height"})]}),e.jsx(i.td,{children:"No"}),e.jsx(i.td,{children:"Optional spatial metadata (pixels)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"imageType"})}),e.jsx(i.td,{children:"No"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:'"embedded"'})," or ",e.jsx(i.code,{children:'"screenshot"'}),". Distinguishes images extracted from the document body from page renders. Omit for hand-crafted artifacts."]})]})]})]}),`
`,e.jsxs(i.p,{children:["Either ",e.jsx(i.code,{children:"url"})," or ",e.jsx(i.code,{children:"base64"})," must be present."]}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"imageType"})," field is set automatically by the PDF parser: ",e.jsx(i.code,{children:'"embedded"'})," for images extracted from the PDF body (requires ",e.jsx(i.code,{children:"--images"}),"), ",e.jsx(i.code,{children:'"screenshot"'})," for full-page renders (requires ",e.jsx(i.code,{children:"--screenshots"}),"). The artifact viewer uses this field to filter and badge images independently."]}),`
`,e.jsx(i.h3,{id:"complete-example",children:"Complete example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"["})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "id"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"invoice-2024-1042"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"pdf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "contents"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'        "page"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'        "text"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"INVOICE'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Invoice #: 1042"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Date: 2024-03-01"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"Bill To: Acme Corp"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'..."'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'        "media"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"image"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "base64"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"iVBORw0KGgoAAAANS..."'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "text"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Company logo"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "imageType"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"embedded"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"image"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "base64"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"iVBORw0KGgoAAAANS..."'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'            "imageType"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"screenshot"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"          }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        ]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'        "page"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'        "text"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Line Items:'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"- Widget A x10 @ $50.00 = $500.00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"- Widget B x5 @ $200.00 = $1,000.00"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'Total: $1,500.00"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    ],"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "metadata"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'      "filename"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"invoice-1042.pdf"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'      "source"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"email-attachment"'})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"})})]})})}),`
`,e.jsx(i.h2,{id:"validation",children:"Validation"}),`
`,e.jsx(i.p,{children:"Struktur validates artifact JSON before processing. Use the CLI:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# From stdin"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# or from a file:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" verify"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" artifacts.json"})]})]})})}),`
`,e.jsxs(i.p,{children:["Returns ",e.jsx(i.code,{children:'{ "valid": true, "artifacts": 1 }'})," on success, throws with error detail on failure."]}),`
`,e.jsx(i.h2,{id:"built-in-artifact-creation",children:"Built-in artifact creation"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Path"}),e.jsx(i.th,{children:"Description"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"--input <file>"})," (CLI)"]}),e.jsxs(i.td,{children:["MIME detection + parser resolution; PDF uses built-in ",e.jsx(i.code,{children:"parsePdf"})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"--stdin"})," (CLI)"]}),e.jsxs(i.td,{children:["MIME detection on buffer; ",e.jsx(i.code,{children:"text/plain"})," falls back to text artifact"]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"parse()"})," (SDK)"]}),e.jsxs(i.td,{children:["Accepts ",e.jsx(i.code,{children:'kind: "text"'}),", ",e.jsx(i.code,{children:'kind: "file"'}),", ",e.jsx(i.code,{children:'kind: "buffer"'}),", ",e.jsx(i.code,{children:'kind: "artifact-json"'})]})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"urlToArtifact()"})," (SDK)"]}),e.jsxs(i.td,{children:["Fetches URL, validates as ",e.jsx(i.code,{children:"SerializedArtifact[]"})]})]})]})]}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/preprocessing/built-in-inputs",children:"Built-in Input Types"})," — how to get input into Struktur"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/sdk/artifact-helpers",children:"Artifact Helpers"})," — the SDK API"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/parsers",children:"Parsers"})," — how files are converted to artifacts"]}),`
`]})]})}function d(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(n,{...t})}):n(t)}export{a as _markdown,d as default,h as frontmatter,l as structuredData,r as toc};
