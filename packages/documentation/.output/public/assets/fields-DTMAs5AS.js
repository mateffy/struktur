import{j as s}from"./main-DmNcsfUg.js";let h=`

The \`--fields\` flag (short: \`-f\`) lets you describe extraction output as a comma-separated string directly on the command line, without writing or maintaining a JSON Schema file.

\`\`\`bash
echo "The Dark Knight (2008), directed by Christopher Nolan. Genre: action." | \\
  struktur --stdin --fields "title, year:integer, director, genre" \\
  --model openai/gpt-4o-mini
\`\`\`

Output:

\`\`\`json
{
  "title": "The Dark Knight",
  "year": 2008,
  "director": "Christopher Nolan",
  "genre": "action"
}
\`\`\`

***

Synopsis [#synopsis]

\`\`\`bash
struktur [extract] --fields "<field-definitions>" [other options]
\`\`\`

\`--fields\` is one of three mutually exclusive schema options. Pass exactly one of:

| Flag                   | Description               |
| ---------------------- | ------------------------- |
| \`--fields\` / \`-f\`      | Fields shorthand string   |
| \`--schema <path\\|url>\` | JSON Schema file or URL   |
| \`--schema-json <json>\` | Inline JSON Schema string |

***

Field syntax [#field-syntax]

\`\`\`
fields = field ("," field)*
field  = name
       | name ":" type
\`\`\`

Whitespace around commas and colons is ignored.

Scalar types [#scalar-types]

| Type        | JSON Schema                 | Notes                            |
| ----------- | --------------------------- | -------------------------------- |
| *(omitted)* | \`string\`                    | Default when no type given       |
| \`string\`    | \`string\`                    |                                  |
| \`number\`    | \`number\`                    |                                  |
| \`float\`     | \`number\`                    | Alias for \`number\`               |
| \`boolean\`   | \`boolean\`                   |                                  |
| \`bool\`      | \`boolean\`                   | Alias for \`boolean\`              |
| \`integer\`   | \`integer\`                   | Whole numbers (JSON Schema spec) |
| \`int\`       | \`integer\` + \`multipleOf: 1\` | Explicitly disallows fractions   |

Enums [#enums]

\`\`\`bash
--fields "status:enum{draft|published|archived}"
\`\`\`

Values are separated by \`|\`. At least two values are required.

Arrays [#arrays]

\`\`\`bash
--fields "tags:array{string}"
--fields "scores:array{float}"
--fields "ids:array{int}"
\`\`\`

The item type can be any scalar keyword (including aliases).

***

Examples [#examples]

**Basic fields with types:**

\`\`\`bash
struktur --input article.txt \\
  --fields "title, author, published_date, word_count:integer" \\
  --model openai/gpt-4o-mini
\`\`\`

**Enum field:**

\`\`\`bash
echo "Order #4421 is currently being packed." | \\
  struktur --stdin \\
  --fields "order_id, status:enum{pending|processing|shipped|delivered}" \\
  --model anthropic/claude-3-5-haiku-20241022
\`\`\`

**Mixed types including arrays:**

\`\`\`bash
struktur --input product.html \\
  --fields "name, price:float, in_stock:bool, tags:array{string}, category:enum{electronics|clothing|food}" \\
  --model openai/gpt-4o-mini
\`\`\`

**Piped from stdin, output to file:**

\`\`\`bash
cat reviews.txt | \\
  struktur --stdin \\
  --fields "sentiment:enum{positive|neutral|negative}, score:int, summary" \\
  --model openai/gpt-4o-mini \\
  --output result.json
\`\`\`

**Batch processing a directory:**

\`\`\`bash
for f in docs/*.txt; do
  struktur --input "$f" \\
    --fields "title, category:enum{invoice|receipt|contract}, amount:float" \\
    --model openai/gpt-4o-mini \\
    --output "out/$(basename "$f" .txt).json"
done
\`\`\`

***

Generated schema [#generated-schema]

\`--fields "title, price:number, tags:array{string}"\` produces this schema internally:

\`\`\`json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "price": { "type": "number" },
    "tags":  { "type": "array", "items": { "type": "string" } }
  },
  "required": ["title", "price", "tags"],
  "additionalProperties": false
}
\`\`\`

All fields are required. For optional fields, nested objects, or \`$ref\`, use \`--schema\` instead.

***

Error messages [#error-messages]

Bad field definitions fail immediately with a helpful message:

\`\`\`bash
--fields "count:bigint"
# Error: Unknown type "bigint" for field "count".
#        Scalar types: bool, boolean, float, int, integer, number, string.
#        Complex types: enum{a|b|c}, array{string}.

--fields "role:enum{admin}"
# Error: enum for field "role" must have at least two values separated by "|", got: "admin".

--fields "tags:array{}"
# Error: array for field "tags" requires an item type, e.g. array{string}.

--fields "name:enum{a|b"
# Error: Unmatched braces in fields string.
\`\`\`

***

When to use --fields vs --schema [#when-to-use---fields-vs---schema]

| Situation                                  | Use        |
| ------------------------------------------ | ---------- |
| Quick one-liner or experiment              | \`--fields\` |
| All fields are flat, all required          | \`--fields\` |
| Need optional properties or nested objects | \`--schema\` |
| Schema is reused across many runs          | \`--schema\` |
| Need \`$ref\`, \`allOf\`, custom formats       | \`--schema\` |

***

See also [#see-also]

* [extract](/docs/cli/extract) — full CLI flag reference
* [SDK Fields Shorthand](/docs/sdk/fields) — using fields from TypeScript
`,t={title:"--fields",description:"Build schemas on the fly from the CLI using a concise field definition string."},a={contents:[{heading:void 0,content:"The `--fields` flag (short: `-f`) lets you describe extraction output as a comma-separated string directly on the command line, without writing or maintaining a JSON Schema file."},{heading:void 0,content:"Output:"},{heading:"synopsis",content:"`--fields` is one of three mutually exclusive schema options. Pass exactly one of:"},{heading:"synopsis",content:"Flag"},{heading:"synopsis",content:"Description"},{heading:"synopsis",content:"`--fields` / `-f`"},{heading:"synopsis",content:"Fields shorthand string"},{heading:"synopsis",content:"`--schema <path\\|url>`"},{heading:"synopsis",content:"JSON Schema file or URL"},{heading:"synopsis",content:"`--schema-json <json>`"},{heading:"synopsis",content:"Inline JSON Schema string"},{heading:"field-syntax",content:"Whitespace around commas and colons is ignored."},{heading:"scalar-types",content:"Type"},{heading:"scalar-types",content:"JSON Schema"},{heading:"scalar-types",content:"Notes"},{heading:"scalar-types",content:"*(omitted)*"},{heading:"scalar-types",content:"`string`"},{heading:"scalar-types",content:"Default when no type given"},{heading:"scalar-types",content:"`string`"},{heading:"scalar-types",content:"`string`"},{heading:"scalar-types",content:"`number`"},{heading:"scalar-types",content:"`number`"},{heading:"scalar-types",content:"`float`"},{heading:"scalar-types",content:"`number`"},{heading:"scalar-types",content:"Alias for `number`"},{heading:"scalar-types",content:"`boolean`"},{heading:"scalar-types",content:"`boolean`"},{heading:"scalar-types",content:"`bool`"},{heading:"scalar-types",content:"`boolean`"},{heading:"scalar-types",content:"Alias for `boolean`"},{heading:"scalar-types",content:"`integer`"},{heading:"scalar-types",content:"`integer`"},{heading:"scalar-types",content:"Whole numbers (JSON Schema spec)"},{heading:"scalar-types",content:"`int`"},{heading:"scalar-types",content:"`integer` + `multipleOf: 1`"},{heading:"scalar-types",content:"Explicitly disallows fractions"},{heading:"enums",content:"Values are separated by `|`. At least two values are required."},{heading:"arrays",content:"The item type can be any scalar keyword (including aliases)."},{heading:"examples",content:"**Basic fields with types:**"},{heading:"examples",content:"**Enum field:**"},{heading:"examples",content:"**Mixed types including arrays:**"},{heading:"examples",content:"**Piped from stdin, output to file:**"},{heading:"examples",content:"**Batch processing a directory:**"},{heading:"generated-schema",content:'`--fields "title, price:number, tags:array{string}"` produces this schema internally:'},{heading:"generated-schema",content:"All fields are required. For optional fields, nested objects, or `$ref`, use `--schema` instead."},{heading:"error-messages",content:"Bad field definitions fail immediately with a helpful message:"},{heading:"when-to-use---fields-vs---schema",content:"Situation"},{heading:"when-to-use---fields-vs---schema",content:"Use"},{heading:"when-to-use---fields-vs---schema",content:"Quick one-liner or experiment"},{heading:"when-to-use---fields-vs---schema",content:"`--fields`"},{heading:"when-to-use---fields-vs---schema",content:"All fields are flat, all required"},{heading:"when-to-use---fields-vs---schema",content:"`--fields`"},{heading:"when-to-use---fields-vs---schema",content:"Need optional properties or nested objects"},{heading:"when-to-use---fields-vs---schema",content:"`--schema`"},{heading:"when-to-use---fields-vs---schema",content:"Schema is reused across many runs"},{heading:"when-to-use---fields-vs---schema",content:"`--schema`"},{heading:"when-to-use---fields-vs---schema",content:"Need `$ref`, `allOf`, custom formats"},{heading:"when-to-use---fields-vs---schema",content:"`--schema`"},{heading:"see-also",content:"extract — full CLI flag reference"},{heading:"see-also",content:"SDK Fields Shorthand — using fields from TypeScript"}],headings:[{id:"synopsis",content:"Synopsis"},{id:"field-syntax",content:"Field syntax"},{id:"scalar-types",content:"Scalar types"},{id:"enums",content:"Enums"},{id:"arrays",content:"Arrays"},{id:"examples",content:"Examples"},{id:"generated-schema",content:"Generated schema"},{id:"error-messages",content:"Error messages"},{id:"when-to-use---fields-vs---schema",content:"When to use `--fields` vs `--schema`"},{id:"see-also",content:"See also"}]};const r=[{depth:2,url:"#synopsis",title:s.jsx(s.Fragment,{children:"Synopsis"})},{depth:2,url:"#field-syntax",title:s.jsx(s.Fragment,{children:"Field syntax"})},{depth:3,url:"#scalar-types",title:s.jsx(s.Fragment,{children:"Scalar types"})},{depth:3,url:"#enums",title:s.jsx(s.Fragment,{children:"Enums"})},{depth:3,url:"#arrays",title:s.jsx(s.Fragment,{children:"Arrays"})},{depth:2,url:"#examples",title:s.jsx(s.Fragment,{children:"Examples"})},{depth:2,url:"#generated-schema",title:s.jsx(s.Fragment,{children:"Generated schema"})},{depth:2,url:"#error-messages",title:s.jsx(s.Fragment,{children:"Error messages"})},{depth:2,url:"#when-to-use---fields-vs---schema",title:s.jsxs(s.Fragment,{children:["When to use ",s.jsx("code",{children:"--fields"})," vs ",s.jsx("code",{children:"--schema"})]})},{depth:2,url:"#see-also",title:s.jsx(s.Fragment,{children:"See also"})}];function n(e){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...e.components};return s.jsxs(s.Fragment,{children:[s.jsxs(i.p,{children:["The ",s.jsx(i.code,{children:"--fields"})," flag (short: ",s.jsx(i.code,{children:"-f"}),") lets you describe extraction output as a comma-separated string directly on the command line, without writing or maintaining a JSON Schema file."]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "The Dark Knight (2008), directed by Christopher Nolan. Genre: action."'}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, year:integer, director, genre"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,s.jsx(i.p,{children:"Output:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "title"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"The Dark Knight"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "year"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"2008"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "director"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Christopher Nolan"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "genre"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"action"'})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsx(i.hr,{}),`
`,s.jsx(i.h2,{id:"synopsis",children:"Synopsis"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsx(i.code,{children:s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [extract] --fields "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"<field-definitions>"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [other options]"})]})})})}),`
`,s.jsxs(i.p,{children:[s.jsx(i.code,{children:"--fields"})," is one of three mutually exclusive schema options. Pass exactly one of:"]}),`
`,s.jsxs(i.table,{children:[s.jsx(i.thead,{children:s.jsxs(i.tr,{children:[s.jsx(i.th,{children:"Flag"}),s.jsx(i.th,{children:"Description"})]})}),s.jsxs(i.tbody,{children:[s.jsxs(i.tr,{children:[s.jsxs(i.td,{children:[s.jsx(i.code,{children:"--fields"})," / ",s.jsx(i.code,{children:"-f"})]}),s.jsx(i.td,{children:"Fields shorthand string"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"--schema <path|url>"})}),s.jsx(i.td,{children:"JSON Schema file or URL"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"--schema-json <json>"})}),s.jsx(i.td,{children:"Inline JSON Schema string"})]})]})]}),`
`,s.jsx(i.hr,{}),`
`,s.jsx(i.h2,{id:"field-syntax",children:"Field syntax"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{children:'fields = field ("," field)*'})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{children:"field  = name"})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{children:'       | name ":" type'})})]})})}),`
`,s.jsx(i.p,{children:"Whitespace around commas and colons is ignored."}),`
`,s.jsx(i.h3,{id:"scalar-types",children:"Scalar types"}),`
`,s.jsxs(i.table,{children:[s.jsx(i.thead,{children:s.jsxs(i.tr,{children:[s.jsx(i.th,{children:"Type"}),s.jsx(i.th,{children:"JSON Schema"}),s.jsx(i.th,{children:"Notes"})]})}),s.jsxs(i.tbody,{children:[s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.em,{children:"(omitted)"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"string"})}),s.jsx(i.td,{children:"Default when no type given"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"string"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"string"})}),s.jsx(i.td,{})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"number"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"number"})}),s.jsx(i.td,{})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"float"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"number"})}),s.jsxs(i.td,{children:["Alias for ",s.jsx(i.code,{children:"number"})]})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"boolean"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"boolean"})}),s.jsx(i.td,{})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"bool"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"boolean"})}),s.jsxs(i.td,{children:["Alias for ",s.jsx(i.code,{children:"boolean"})]})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"integer"})}),s.jsx(i.td,{children:s.jsx(i.code,{children:"integer"})}),s.jsx(i.td,{children:"Whole numbers (JSON Schema spec)"})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:s.jsx(i.code,{children:"int"})}),s.jsxs(i.td,{children:[s.jsx(i.code,{children:"integer"})," + ",s.jsx(i.code,{children:"multipleOf: 1"})]}),s.jsx(i.td,{children:"Explicitly disallows fractions"})]})]})]}),`
`,s.jsx(i.h3,{id:"enums",children:"Enums"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsx(i.code,{children:s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "status:enum{draft|published|archived}"'})]})})})}),`
`,s.jsxs(i.p,{children:["Values are separated by ",s.jsx(i.code,{children:"|"}),". At least two values are required."]}),`
`,s.jsx(i.h3,{id:"arrays",children:"Arrays"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "tags:array{string}"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "scores:array{float}"'})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "ids:array{int}"'})]})]})})}),`
`,s.jsx(i.p,{children:"The item type can be any scalar keyword (including aliases)."}),`
`,s.jsx(i.hr,{}),`
`,s.jsx(i.h2,{id:"examples",children:"Examples"}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Basic fields with types:"})}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" article.txt"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, author, published_date, word_count:integer"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Enum field:"})}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"echo"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "Order #4421 is currently being packed."'}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "order_id, status:enum{pending|processing|shipped|delivered}"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" anthropic/claude-3-5-haiku-20241022"})]})]})})}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Mixed types including arrays:"})}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" product.html"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "name, price:float, in_stock:bool, tags:array{string}, category:enum{electronics|clothing|food}"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Piped from stdin, output to file:"})}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"cat"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reviews.txt"}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdin"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "sentiment:enum{positive|neutral|negative}, score:int, summary"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --model"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  --output"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" result.json"})]})]})})}),`
`,s.jsx(i.p,{children:s.jsx(i.strong,{children:"Batch processing a directory:"})}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" f "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" docs/*.txt"}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"do"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  struktur"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$f"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    --fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "title, category:enum{invoice|receipt|contract}, amount:float"'}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    --model"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    --output"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "out/$('}),s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"basename"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$f"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" .txt).json"'})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"done"})})]})})}),`
`,s.jsx(i.hr,{}),`
`,s.jsx(i.h2,{id:"generated-schema",children:"Generated schema"}),`
`,s.jsxs(i.p,{children:[s.jsx(i.code,{children:'--fields "title, price:number, tags:array{string}"'})," produces this schema internally:"]}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "type"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"object"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "properties"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "title"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": { "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"string"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "price"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": { "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"number"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'    "tags"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":  { "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"array"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"items"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": { "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'"type"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"string"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" } }"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "required"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"price"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"tags"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "additionalProperties"'}),s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),s.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,s.jsxs(i.p,{children:["All fields are required. For optional fields, nested objects, or ",s.jsx(i.code,{children:"$ref"}),", use ",s.jsx(i.code,{children:"--schema"})," instead."]}),`
`,s.jsx(i.hr,{}),`
`,s.jsx(i.h2,{id:"error-messages",children:"Error messages"}),`
`,s.jsx(i.p,{children:"Bad field definitions fail immediately with a helpful message:"}),`
`,s.jsx(s.Fragment,{children:s.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:s.jsxs(i.code,{children:[s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "count:bigint"'})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# Error: Unknown type "bigint" for field "count".'})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#        Scalar types: bool, boolean, float, int, integer, number, string."})}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"#        Complex types: enum{a|b|c}, array{string}."})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "role:enum{admin}"'})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# Error: enum for field "role" must have at least two values separated by "|", got: "admin".'})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "tags:array{}"'})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'# Error: array for field "tags" requires an item type, e.g. array{string}.'})}),`
`,s.jsx(i.span,{className:"line"}),`
`,s.jsxs(i.span,{className:"line",children:[s.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"--fields"}),s.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "name:enum{a|b"'})]}),`
`,s.jsx(i.span,{className:"line",children:s.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Error: Unmatched braces in fields string."})})]})})}),`
`,s.jsx(i.hr,{}),`
`,s.jsxs(i.h2,{id:"when-to-use---fields-vs---schema",children:["When to use ",s.jsx(i.code,{children:"--fields"})," vs ",s.jsx(i.code,{children:"--schema"})]}),`
`,s.jsxs(i.table,{children:[s.jsx(i.thead,{children:s.jsxs(i.tr,{children:[s.jsx(i.th,{children:"Situation"}),s.jsx(i.th,{children:"Use"})]})}),s.jsxs(i.tbody,{children:[s.jsxs(i.tr,{children:[s.jsx(i.td,{children:"Quick one-liner or experiment"}),s.jsx(i.td,{children:s.jsx(i.code,{children:"--fields"})})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:"All fields are flat, all required"}),s.jsx(i.td,{children:s.jsx(i.code,{children:"--fields"})})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:"Need optional properties or nested objects"}),s.jsx(i.td,{children:s.jsx(i.code,{children:"--schema"})})]}),s.jsxs(i.tr,{children:[s.jsx(i.td,{children:"Schema is reused across many runs"}),s.jsx(i.td,{children:s.jsx(i.code,{children:"--schema"})})]}),s.jsxs(i.tr,{children:[s.jsxs(i.td,{children:["Need ",s.jsx(i.code,{children:"$ref"}),", ",s.jsx(i.code,{children:"allOf"}),", custom formats"]}),s.jsx(i.td,{children:s.jsx(i.code,{children:"--schema"})})]})]})]}),`
`,s.jsx(i.hr,{}),`
`,s.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,s.jsxs(i.ul,{children:[`
`,s.jsxs(i.li,{children:[s.jsx(i.a,{href:"/docs/cli/extract",children:"extract"})," — full CLI flag reference"]}),`
`,s.jsxs(i.li,{children:[s.jsx(i.a,{href:"/docs/sdk/fields",children:"SDK Fields Shorthand"})," — using fields from TypeScript"]}),`
`]})]})}function d(e={}){const{wrapper:i}=e.components||{};return i?s.jsx(i,{...e,children:s.jsx(n,{...e})}):n(e)}export{h as _markdown,d as default,t as frontmatter,a as structuredData,r as toc};
