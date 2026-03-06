import{j as e}from"./main-BVs-cBtG.js";let l=`

The \`fields\` parameter lets you describe extraction output as a concise comma-separated string instead of writing a full JSON Schema object. It is designed for quick experiments, CLI one-liners, and any situation where you know the fields you want but don't need schema reuse or complex constraints.

\`\`\`ts
const result = await extract({
  artifacts,
  fields: "title, author, year:integer, price:number",
  strategy: simple({ model: openai("gpt-4o-mini") }),
});
\`\`\`

\`fields\` and \`schema\` are mutually exclusive. Pass exactly one.

***

Syntax [#syntax]

\`\`\`
fields = field ("," field)*
field  = name | name ":" type
name   = /[^\\s,:{}]+/
type   = scalar | enum | array
\`\`\`

Whitespace around commas and colons is ignored. A trailing comma is silently dropped.

***

Scalar types [#scalar-types]

Every field without an explicit type defaults to \`string\`.

| Type keyword | JSON Schema output                       | Notes                                    |
| ------------ | ---------------------------------------- | ---------------------------------------- |
| \`string\`     | \`{ "type": "string" }\`                   | Default when type is omitted             |
| \`number\`     | \`{ "type": "number" }\`                   | Any numeric value                        |
| \`float\`      | \`{ "type": "number" }\`                   | Alias for \`number\`                       |
| \`boolean\`    | \`{ "type": "boolean" }\`                  |                                          |
| \`bool\`       | \`{ "type": "boolean" }\`                  | Alias for \`boolean\`                      |
| \`integer\`    | \`{ "type": "integer" }\`                  | Whole numbers only (JSON Schema spec)    |
| \`int\`        | \`{ "type": "integer", "multipleOf": 1 }\` | Stricter: explicitly disallows fractions |

\`\`\`ts
// All scalar types
extract({ fields: "title, count:integer, price:float, active:bool", ... })
\`\`\`

int vs integer [#int-vs-integer]

Both resolve to \`"type": "integer"\` in the schema, but \`int\` adds \`"multipleOf": 1\`. This makes the no-fractions constraint explicit and validator-enforced rather than implied. Use \`int\` when you want to be unambiguous; \`integer\` when you want to stay close to JSON Schema vocabulary.

***

Enum type [#enum-type]

Use \`enum{value1|value2|...}\` for fields that must be one of a fixed set of strings. Values are separated by \`|\` and trimmed of surrounding whitespace.

\`\`\`ts
extract({ fields: "status:enum{draft|published|archived}", ... })
// => { "type": "string", "enum": ["draft", "published", "archived"] }
\`\`\`

At least two values are required.

\`\`\`ts
extract({ fields: "name, role:enum{admin|user|guest}, active:bool", ... })
\`\`\`

***

Array type [#array-type]

Use \`array{itemType}\` for array fields. The item type can be any scalar keyword including aliases. You can also use \`array\` as a shorthand for \`array{string}\`.

\`\`\`ts
extract({ fields: "tags:array", ... })
// => { "type": "array", "items": { "type": "string" } }

extract({ fields: "tags:array{string}", ... })
// => { "type": "array", "items": { "type": "string" } }

extract({ fields: "scores:array{float}", ... })
// => { "type": "array", "items": { "type": "number" } }

extract({ fields: "ids:array{int}", ... })
// => { "type": "array", "items": { "type": "integer", "multipleOf": 1 } }
\`\`\`

***

Generated schema shape [#generated-schema-shape]

Every \`fields\` string produces an object schema with:

* \`"type": "object"\`
* All named fields as properties
* All fields listed in \`"required"\`
* \`"additionalProperties": false\`

\`\`\`ts
buildSchemaFromFields("title, price:number, tags:array")
// =>
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

All fields are required. There is no way to mark a field optional through the \`fields\` syntax — use a full \`schema\` object if you need optional properties, nested objects, or \`$ref\`.

***

Using fields with extract() [#using-fields-with-extract]

\`\`\`ts
import { extract, simple } from "@mateffy/struktur";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  fields: "title, author, year:integer, genre:enum{fiction|nonfiction|reference}",
  strategy: simple({ model: openai("gpt-4o-mini") }),
});

// result.data is typed as Record<string, unknown> when using fields
console.log(result.data.title);
\`\`\`

For full TypeScript inference on \`result.data\`, use \`schema\` with \`JSONSchemaType<T>\` instead.

***

Mutual exclusion [#mutual-exclusion]

Only one schema source may be provided per call. Providing more than one throws immediately with a clear error.

| Combination         | Result   |
| ------------------- | -------- |
| \`fields\` only       | ✅ Valid  |
| \`schema\` only       | ✅ Valid  |
| \`fields\` + \`schema\` | ❌ Throws |
| Neither             | ❌ Throws |

\`\`\`ts
// ❌ throws: "Provide exactly one of \`schema\` or \`fields\`"
await extract({ artifacts, schema: mySchema, fields: "title", strategy });
\`\`\`

***

Utility exports [#utility-exports]

The parser and schema builder are exported for use outside of \`extract()\`.

\`\`\`ts
import {
  parseFieldsString,
  buildSchemaFromParsedFields,
  buildSchemaFromFields,
} from "@mateffy/struktur";

// Parse to an intermediate representation
const parsed = parseFieldsString("title, price:number, status:enum{draft|live}");
// [
//   { name: "title",  kind: "scalar", type: "string" },
//   { name: "price",  kind: "scalar", type: "number" },
//   { name: "status", kind: "enum",   values: ["draft", "live"] }
// ]

// Build a schema directly
const schema = buildSchemaFromFields("title, price:number");
\`\`\`

parseFieldsString(fields: string): ParsedField[] [#parsefieldsstringfields-string-parsedfield]

Parses the fields string into an array of \`ParsedField\` discriminated union entries:

\`\`\`ts
type ParsedField =
  | { name: string; kind: "scalar"; type: ScalarFieldType }
  | { name: string; kind: "enum";   values: string[] }
  | { name: string; kind: "array";  items: ScalarFieldType };

type ScalarFieldType = "string" | "number" | "boolean" | "integer" | "int";
\`\`\`

buildSchemaFromParsedFields(fields: ParsedField[]): AnyJSONSchema [#buildschemafromparsedfieldsfields-parsedfield-anyjsonschema]

Builds the JSON Schema object from a pre-parsed array. Useful if you want to inspect or modify the parsed fields before building.

buildSchemaFromFields(fields: string): AnyJSONSchema [#buildschemafromfieldsfields-string-anyjsonschema]

Convenience one-liner: parses and builds in a single call.

***

Error messages [#error-messages]

Parse errors include the offending field name and a hint toward valid alternatives.

\`\`\`ts
parseFieldsString("count:bigint")
// Error: Unknown type "bigint" for field "count".
//        Scalar types: bool, boolean, float, int, integer, number, string.
//        Complex types: enum{a|b|c}, array{string}, or array (shorthand for array{string}).

parseFieldsString("role:enum{admin}")
// Error: enum for field "role" must have at least two values separated by "|", got: "admin".

parseFieldsString("tags:array{}")
// Error: array for field "tags" requires an item type, e.g. array{string}.

parseFieldsString("name:enum{a|b")
// Error: Unmatched braces in fields string.
\`\`\`

***

When to use fields vs schema [#when-to-use-fields-vs-schema]

| Situation                                                     | Use                               |
| ------------------------------------------------------------- | --------------------------------- |
| Quick experiment, ad-hoc query                                | \`fields\`                          |
| CLI one-liner                                                 | \`fields\` / \`--fields\`             |
| All fields are required flat scalars, enums, or simple arrays | \`fields\`                          |
| Need optional properties                                      | \`schema\`                          |
| Need nested objects                                           | \`schema\`                          |
| Need TypeScript inference on \`result.data\`                    | \`schema\` with \`JSONSchemaType<T>\` |
| Schema is reused across calls                                 | \`schema\`                          |
| Need \`$ref\`, \`allOf\`, \`anyOf\`, custom formats                 | \`schema\`                          |

***

See also [#see-also]

* [extract()](/docs/sdk/extract) — full option reference
* [CLI \`--fields\`](/docs/cli/fields) — using fields from the command line
`,t={title:"Fields Shorthand",description:"Build JSON schemas on the fly with a simple comma-separated string instead of writing full JSON Schema objects."},r={contents:[{heading:void 0,content:"The `fields` parameter lets you describe extraction output as a concise comma-separated string instead of writing a full JSON Schema object. It is designed for quick experiments, CLI one-liners, and any situation where you know the fields you want but don't need schema reuse or complex constraints."},{heading:void 0,content:"`fields` and `schema` are mutually exclusive. Pass exactly one."},{heading:"syntax",content:"Whitespace around commas and colons is ignored. A trailing comma is silently dropped."},{heading:"scalar-types",content:"Every field without an explicit type defaults to `string`."},{heading:"scalar-types",content:"Type keyword"},{heading:"scalar-types",content:"JSON Schema output"},{heading:"scalar-types",content:"Notes"},{heading:"scalar-types",content:"`string`"},{heading:"scalar-types",content:'`{ "type": "string" }`'},{heading:"scalar-types",content:"Default when type is omitted"},{heading:"scalar-types",content:"`number`"},{heading:"scalar-types",content:'`{ "type": "number" }`'},{heading:"scalar-types",content:"Any numeric value"},{heading:"scalar-types",content:"`float`"},{heading:"scalar-types",content:'`{ "type": "number" }`'},{heading:"scalar-types",content:"Alias for `number`"},{heading:"scalar-types",content:"`boolean`"},{heading:"scalar-types",content:'`{ "type": "boolean" }`'},{heading:"scalar-types",content:"`bool`"},{heading:"scalar-types",content:'`{ "type": "boolean" }`'},{heading:"scalar-types",content:"Alias for `boolean`"},{heading:"scalar-types",content:"`integer`"},{heading:"scalar-types",content:'`{ "type": "integer" }`'},{heading:"scalar-types",content:"Whole numbers only (JSON Schema spec)"},{heading:"scalar-types",content:"`int`"},{heading:"scalar-types",content:'`{ "type": "integer", "multipleOf": 1 }`'},{heading:"scalar-types",content:"Stricter: explicitly disallows fractions"},{heading:"int-vs-integer",content:'Both resolve to `"type": "integer"` in the schema, but `int` adds `"multipleOf": 1`. This makes the no-fractions constraint explicit and validator-enforced rather than implied. Use `int` when you want to be unambiguous; `integer` when you want to stay close to JSON Schema vocabulary.'},{heading:"enum-type",content:"Use `enum{value1|value2|...}` for fields that must be one of a fixed set of strings. Values are separated by `|` and trimmed of surrounding whitespace."},{heading:"enum-type",content:"At least two values are required."},{heading:"array-type",content:"Use `array{itemType}` for array fields. The item type can be any scalar keyword including aliases. You can also use `array` as a shorthand for `array{string}`."},{heading:"generated-schema-shape",content:"Every `fields` string produces an object schema with:"},{heading:"generated-schema-shape",content:'`"type": "object"`'},{heading:"generated-schema-shape",content:"All named fields as properties"},{heading:"generated-schema-shape",content:'All fields listed in `"required"`'},{heading:"generated-schema-shape",content:'`"additionalProperties": false`'},{heading:"generated-schema-shape",content:"All fields are required. There is no way to mark a field optional through the `fields` syntax — use a full `schema` object if you need optional properties, nested objects, or `$ref`."},{heading:"using-fields-with-extract",content:"For full TypeScript inference on `result.data`, use `schema` with `JSONSchemaType<T>` instead."},{heading:"mutual-exclusion",content:"Only one schema source may be provided per call. Providing more than one throws immediately with a clear error."},{heading:"mutual-exclusion",content:"Combination"},{heading:"mutual-exclusion",content:"Result"},{heading:"mutual-exclusion",content:"`fields` only"},{heading:"mutual-exclusion",content:"✅ Valid"},{heading:"mutual-exclusion",content:"`schema` only"},{heading:"mutual-exclusion",content:"✅ Valid"},{heading:"mutual-exclusion",content:"`fields` + `schema`"},{heading:"mutual-exclusion",content:"❌ Throws"},{heading:"mutual-exclusion",content:"Neither"},{heading:"mutual-exclusion",content:"❌ Throws"},{heading:"utility-exports",content:"The parser and schema builder are exported for use outside of `extract()`."},{heading:"parsefieldsstringfields-string-parsedfield",content:"Parses the fields string into an array of `ParsedField` discriminated union entries:"},{heading:"buildschemafromparsedfieldsfields-parsedfield-anyjsonschema",content:"Builds the JSON Schema object from a pre-parsed array. Useful if you want to inspect or modify the parsed fields before building."},{heading:"buildschemafromfieldsfields-string-anyjsonschema",content:"Convenience one-liner: parses and builds in a single call."},{heading:"error-messages",content:"Parse errors include the offending field name and a hint toward valid alternatives."},{heading:"when-to-use-fields-vs-schema",content:"Situation"},{heading:"when-to-use-fields-vs-schema",content:"Use"},{heading:"when-to-use-fields-vs-schema",content:"Quick experiment, ad-hoc query"},{heading:"when-to-use-fields-vs-schema",content:"`fields`"},{heading:"when-to-use-fields-vs-schema",content:"CLI one-liner"},{heading:"when-to-use-fields-vs-schema",content:"`fields` / `--fields`"},{heading:"when-to-use-fields-vs-schema",content:"All fields are required flat scalars, enums, or simple arrays"},{heading:"when-to-use-fields-vs-schema",content:"`fields`"},{heading:"when-to-use-fields-vs-schema",content:"Need optional properties"},{heading:"when-to-use-fields-vs-schema",content:"`schema`"},{heading:"when-to-use-fields-vs-schema",content:"Need nested objects"},{heading:"when-to-use-fields-vs-schema",content:"`schema`"},{heading:"when-to-use-fields-vs-schema",content:"Need TypeScript inference on `result.data`"},{heading:"when-to-use-fields-vs-schema",content:"`schema` with `JSONSchemaType<T>`"},{heading:"when-to-use-fields-vs-schema",content:"Schema is reused across calls"},{heading:"when-to-use-fields-vs-schema",content:"`schema`"},{heading:"when-to-use-fields-vs-schema",content:"Need `$ref`, `allOf`, `anyOf`, custom formats"},{heading:"when-to-use-fields-vs-schema",content:"`schema`"},{heading:"see-also",content:"extract() — full option reference"},{heading:"see-also",content:"CLI `--fields` — using fields from the command line"}],headings:[{id:"syntax",content:"Syntax"},{id:"scalar-types",content:"Scalar types"},{id:"int-vs-integer",content:"`int` vs `integer`"},{id:"enum-type",content:"Enum type"},{id:"array-type",content:"Array type"},{id:"generated-schema-shape",content:"Generated schema shape"},{id:"using-fields-with-extract",content:"Using `fields` with `extract()`"},{id:"mutual-exclusion",content:"Mutual exclusion"},{id:"utility-exports",content:"Utility exports"},{id:"parsefieldsstringfields-string-parsedfield",content:"`parseFieldsString(fields: string): ParsedField[]`"},{id:"buildschemafromparsedfieldsfields-parsedfield-anyjsonschema",content:"`buildSchemaFromParsedFields(fields: ParsedField[]): AnyJSONSchema`"},{id:"buildschemafromfieldsfields-string-anyjsonschema",content:"`buildSchemaFromFields(fields: string): AnyJSONSchema`"},{id:"error-messages",content:"Error messages"},{id:"when-to-use-fields-vs-schema",content:"When to use `fields` vs `schema`"},{id:"see-also",content:"See also"}]};const h=[{depth:2,url:"#syntax",title:e.jsx(e.Fragment,{children:"Syntax"})},{depth:2,url:"#scalar-types",title:e.jsx(e.Fragment,{children:"Scalar types"})},{depth:3,url:"#int-vs-integer",title:e.jsxs(e.Fragment,{children:[e.jsx("code",{children:"int"})," vs ",e.jsx("code",{children:"integer"})]})},{depth:2,url:"#enum-type",title:e.jsx(e.Fragment,{children:"Enum type"})},{depth:2,url:"#array-type",title:e.jsx(e.Fragment,{children:"Array type"})},{depth:2,url:"#generated-schema-shape",title:e.jsx(e.Fragment,{children:"Generated schema shape"})},{depth:2,url:"#using-fields-with-extract",title:e.jsxs(e.Fragment,{children:["Using ",e.jsx("code",{children:"fields"})," with ",e.jsx("code",{children:"extract()"})]})},{depth:2,url:"#mutual-exclusion",title:e.jsx(e.Fragment,{children:"Mutual exclusion"})},{depth:2,url:"#utility-exports",title:e.jsx(e.Fragment,{children:"Utility exports"})},{depth:3,url:"#parsefieldsstringfields-string-parsedfield",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"parseFieldsString(fields: string): ParsedField[]"})})},{depth:3,url:"#buildschemafromparsedfieldsfields-parsedfield-anyjsonschema",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"buildSchemaFromParsedFields(fields: ParsedField[]): AnyJSONSchema"})})},{depth:3,url:"#buildschemafromfieldsfields-string-anyjsonschema",title:e.jsx(e.Fragment,{children:e.jsx("code",{children:"buildSchemaFromFields(fields: string): AnyJSONSchema"})})},{depth:2,url:"#error-messages",title:e.jsx(e.Fragment,{children:"Error messages"})},{depth:2,url:"#when-to-use-fields-vs-schema",title:e.jsxs(e.Fragment,{children:["When to use ",e.jsx("code",{children:"fields"})," vs ",e.jsx("code",{children:"schema"})]})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function n(s){const i={a:"a",code:"code",h2:"h2",h3:"h3",hr:"hr",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"fields"})," parameter lets you describe extraction output as a concise comma-separated string instead of writing a full JSON Schema object. It is designed for quick experiments, CLI one-liners, and any situation where you know the fields you want but don't need schema reuse or complex constraints."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, author, year:integer, price:number"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") }),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"fields"})," and ",e.jsx(i.code,{children:"schema"})," are mutually exclusive. Pass exactly one."]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"syntax",children:"Syntax"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'fields = field ("," field)*'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'field  = name | name ":" type'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"name   = /[^\\s,:{}]+/"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"type   = scalar | enum | array"})})]})})}),`
`,e.jsx(i.p,{children:"Whitespace around commas and colons is ignored. A trailing comma is silently dropped."}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"scalar-types",children:"Scalar types"}),`
`,e.jsxs(i.p,{children:["Every field without an explicit type defaults to ",e.jsx(i.code,{children:"string"}),"."]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Type keyword"}),e.jsx(i.th,{children:"JSON Schema output"}),e.jsx(i.th,{children:"Notes"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"string"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "string" }'})}),e.jsx(i.td,{children:"Default when type is omitted"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"number"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "number" }'})}),e.jsx(i.td,{children:"Any numeric value"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"float"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "number" }'})}),e.jsxs(i.td,{children:["Alias for ",e.jsx(i.code,{children:"number"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"boolean"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "boolean" }'})}),e.jsx(i.td,{})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"bool"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "boolean" }'})}),e.jsxs(i.td,{children:["Alias for ",e.jsx(i.code,{children:"boolean"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"integer"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "integer" }'})}),e.jsx(i.td,{children:"Whole numbers only (JSON Schema spec)"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.code,{children:"int"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:'{ "type": "integer", "multipleOf": 1 }'})}),e.jsx(i.td,{children:"Stricter: explicitly disallows fractions"})]})]})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// All scalar types"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, count:integer, price:float, active:bool"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]})]})})}),`
`,e.jsxs(i.h3,{id:"int-vs-integer",children:[e.jsx(i.code,{children:"int"})," vs ",e.jsx(i.code,{children:"integer"})]}),`
`,e.jsxs(i.p,{children:["Both resolve to ",e.jsx(i.code,{children:'"type": "integer"'})," in the schema, but ",e.jsx(i.code,{children:"int"})," adds ",e.jsx(i.code,{children:'"multipleOf": 1'}),". This makes the no-fractions constraint explicit and validator-enforced rather than implied. Use ",e.jsx(i.code,{children:"int"})," when you want to be unambiguous; ",e.jsx(i.code,{children:"integer"})," when you want to stay close to JSON Schema vocabulary."]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"enum-type",children:"Enum type"}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"enum{value1|value2|...}"})," for fields that must be one of a fixed set of strings. Values are separated by ",e.jsx(i.code,{children:"|"})," and trimmed of surrounding whitespace."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"status:enum{draft|published|archived}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// => { "type": "string", "enum": ["draft", "published", "archived"] }'})})]})})}),`
`,e.jsx(i.p,{children:"At least two values are required."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"name, role:enum{admin|user|guest}, active:bool"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]})})})}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"array-type",children:"Array type"}),`
`,e.jsxs(i.p,{children:["Use ",e.jsx(i.code,{children:"array{itemType}"})," for array fields. The item type can be any scalar keyword including aliases. You can also use ",e.jsx(i.code,{children:"array"})," as a shorthand for ",e.jsx(i.code,{children:"array{string}"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"tags:array"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// => { "type": "array", "items": { "type": "string" } }'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"tags:array{string}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// => { "type": "array", "items": { "type": "string" } }'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"scores:array{float}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// => { "type": "array", "items": { "type": "number" } }'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ids:array{int}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"..."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// => { "type": "array", "items": { "type": "integer", "multipleOf": 1 } }'})})]})})}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"generated-schema-shape",children:"Generated schema shape"}),`
`,e.jsxs(i.p,{children:["Every ",e.jsx(i.code,{children:"fields"})," string produces an object schema with:"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:'"type": "object"'})}),`
`,e.jsx(i.li,{children:"All named fields as properties"}),`
`,e.jsxs(i.li,{children:["All fields listed in ",e.jsx(i.code,{children:'"required"'})]}),`
`,e.jsx(i.li,{children:e.jsx(i.code,{children:'"additionalProperties": false'})}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"buildSchemaFromFields"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, price:number, tags:array"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// =>"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"object"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "properties"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'    "title"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": { "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"string"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'    "price"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": { "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"number"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" },"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'    "tags"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":  { "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"array"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"items"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": { "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"type"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"string"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" } }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "required"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"price"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"tags"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'  "additionalProperties"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"false"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(i.p,{children:["All fields are required. There is no way to mark a field optional through the ",e.jsx(i.code,{children:"fields"})," syntax — use a full ",e.jsx(i.code,{children:"schema"})," object if you need optional properties, nested objects, or ",e.jsx(i.code,{children:"$ref"}),"."]}),`
`,e.jsx(i.hr,{}),`
`,e.jsxs(i.h2,{id:"using-fields-with-extract",children:["Using ",e.jsx(i.code,{children:"fields"})," with ",e.jsx(i.code,{children:"extract()"})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract, simple } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { openai } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@ai-sdk/openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, author, year:integer, genre:enum{fiction|nonfiction|reference}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ model: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"openai"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") }),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// result.data is typed as Record<string, unknown> when using fields"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(result.data.title);"})]})]})})}),`
`,e.jsxs(i.p,{children:["For full TypeScript inference on ",e.jsx(i.code,{children:"result.data"}),", use ",e.jsx(i.code,{children:"schema"})," with ",e.jsx(i.code,{children:"JSONSchemaType<T>"})," instead."]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"mutual-exclusion",children:"Mutual exclusion"}),`
`,e.jsx(i.p,{children:"Only one schema source may be provided per call. Providing more than one throws immediately with a clear error."}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Combination"}),e.jsx(i.th,{children:"Result"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"fields"})," only"]}),e.jsx(i.td,{children:"✅ Valid"})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"schema"})," only"]}),e.jsx(i.td,{children:"✅ Valid"})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:[e.jsx(i.code,{children:"fields"})," + ",e.jsx(i.code,{children:"schema"})]}),e.jsx(i.td,{children:"❌ Throws"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Neither"}),e.jsx(i.td,{children:"❌ Throws"})]})]})]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// ❌ throws: "Provide exactly one of `schema` or `fields`"'})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ artifacts, schema: mySchema, fields: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", strategy });"})]})]})})}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"utility-exports",children:"Utility exports"}),`
`,e.jsxs(i.p,{children:["The parser and schema builder are exported for use outside of ",e.jsx(i.code,{children:"extract()"}),"."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  parseFieldsString,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  buildSchemaFromParsedFields,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  buildSchemaFromFields,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"} "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@mateffy/struktur"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Parse to an intermediate representation"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" parsed"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" parseFieldsString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, price:number, status:enum{draft|live}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ["})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'//   { name: "title",  kind: "scalar", type: "string" },'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'//   { name: "price",  kind: "scalar", type: "number" },'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'//   { name: "status", kind: "enum",   values: ["draft", "live"] }'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// ]"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Build a schema directly"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" schema"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" buildSchemaFromFields"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"title, price:number"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]})]})})}),`
`,e.jsx(i.h3,{id:"parsefieldsstringfields-string-parsedfield",children:e.jsx(i.code,{children:"parseFieldsString(fields: string): ParsedField[]"})}),`
`,e.jsxs(i.p,{children:["Parses the fields string into an array of ",e.jsx(i.code,{children:"ParsedField"})," discriminated union entries:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"type"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ParsedField"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" string"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"kind"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "scalar"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"type"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ScalarFieldType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" string"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"kind"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "enum"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";   "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"values"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" string"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"[] }"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  |"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" string"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"; "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"kind"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "array"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";  "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"items"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ScalarFieldType"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" };"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"type"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" ScalarFieldType"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "string"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "number"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "boolean"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "integer"'}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" |"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "int"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`,e.jsx(i.h3,{id:"buildschemafromparsedfieldsfields-parsedfield-anyjsonschema",children:e.jsx(i.code,{children:"buildSchemaFromParsedFields(fields: ParsedField[]): AnyJSONSchema"})}),`
`,e.jsx(i.p,{children:"Builds the JSON Schema object from a pre-parsed array. Useful if you want to inspect or modify the parsed fields before building."}),`
`,e.jsx(i.h3,{id:"buildschemafromfieldsfields-string-anyjsonschema",children:e.jsx(i.code,{children:"buildSchemaFromFields(fields: string): AnyJSONSchema"})}),`
`,e.jsx(i.p,{children:"Convenience one-liner: parses and builds in a single call."}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"error-messages",children:"Error messages"}),`
`,e.jsx(i.p,{children:"Parse errors include the offending field name and a hint toward valid alternatives."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parseFieldsString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"count:bigint"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// Error: Unknown type "bigint" for field "count".'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//        Scalar types: bool, boolean, float, int, integer, number, string."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"//        Complex types: enum{a|b|c}, array{string}, or array (shorthand for array{string})."})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parseFieldsString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"role:enum{admin}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// Error: enum for field "role" must have at least two values separated by "|", got: "admin".'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parseFieldsString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"tags:array{}"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:'// Error: array for field "tags" requires an item type, e.g. array{string}.'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parseFieldsString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"name:enum{a|b"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Error: Unmatched braces in fields string."})})]})})}),`
`,e.jsx(i.hr,{}),`
`,e.jsxs(i.h2,{id:"when-to-use-fields-vs-schema",children:["When to use ",e.jsx(i.code,{children:"fields"})," vs ",e.jsx(i.code,{children:"schema"})]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Situation"}),e.jsx(i.th,{children:"Use"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Quick experiment, ad-hoc query"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"fields"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"CLI one-liner"}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"fields"})," / ",e.jsx(i.code,{children:"--fields"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"All fields are required flat scalars, enums, or simple arrays"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"fields"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Need optional properties"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"schema"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Need nested objects"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"schema"})})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["Need TypeScript inference on ",e.jsx(i.code,{children:"result.data"})]}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"schema"})," with ",e.jsx(i.code,{children:"JSONSchemaType<T>"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Schema is reused across calls"}),e.jsx(i.td,{children:e.jsx(i.code,{children:"schema"})})]}),e.jsxs(i.tr,{children:[e.jsxs(i.td,{children:["Need ",e.jsx(i.code,{children:"$ref"}),", ",e.jsx(i.code,{children:"allOf"}),", ",e.jsx(i.code,{children:"anyOf"}),", custom formats"]}),e.jsx(i.td,{children:e.jsx(i.code,{children:"schema"})})]})]})]}),`
`,e.jsx(i.hr,{}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/sdk/extract",children:"extract()"})," — full option reference"]}),`
`,e.jsxs(i.li,{children:[e.jsxs(i.a,{href:"/docs/cli/fields",children:["CLI ",e.jsx(i.code,{children:"--fields"})]})," — using fields from the command line"]}),`
`]})]})}function d(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{l as _markdown,d as default,t as frontmatter,r as structuredData,h as toc};
