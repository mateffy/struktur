

The `--fields` flag (short: `-f`) lets you describe extraction output as a comma-separated string directly on the command line, without writing or maintaining a JSON Schema file.

```bash
echo "The Dark Knight (2008), directed by Christopher Nolan. Genre: action." | \
  struktur --stdin --fields "title, year:integer, director, genre" \
  --model openai/gpt-4o-mini
```

Output:

```json
{
  "title": "The Dark Knight",
  "year": 2008,
  "director": "Christopher Nolan",
  "genre": "action"
}
```

***

Synopsis [#synopsis]

```bash
struktur [extract] --fields "<field-definitions>" [other options]
```

`--fields` is one of three mutually exclusive schema options. Pass exactly one of:

| Flag                   | Description               |
| ---------------------- | ------------------------- |
| `--fields` / `-f`      | Fields shorthand string   |
| `--schema <path\|url>` | JSON Schema file or URL   |
| `--schema-json <json>` | Inline JSON Schema string |

***

Field syntax [#field-syntax]

```
fields = field ("," field)*
field  = name
       | name ":" type
```

Whitespace around commas and colons is ignored.

***

Scalar types [#scalar-types]

string [#string]

```bash
--fields "title"
--fields "title:string"
```

Default when no type is specified. Produces `{ "type": "string" }`.

number / float [#number--float]

```bash
--fields "price:number"
--fields "price:float"
```

Any numeric value. Both produce `{ "type": "number" }`. `float` is an alias for `number`.

integer / int [#integer--int]

```bash
--fields "count:integer"
--fields "count:int"
```

Whole numbers only. `integer` produces `{ "type": "integer" }`. `int` produces `{ "type": "integer", "multipleOf": 1 }` — explicitly disallows fractions.

boolean / bool [#boolean--bool]

```bash
--fields "active:boolean"
--fields "active:bool"
```

Both produce `{ "type": "boolean" }`. `bool` is an alias for `boolean`.

***

Enums [#enums]

```bash
--fields "status:enum{draft|published|archived}"
```

Values are separated by `|`. At least two values are required.

***

Arrays [#arrays]

```bash
--fields "tags:array"              # shorthand for array{string}
--fields "tags:array{string}"
--fields "scores:array{float}"
--fields "ids:array{int}"
```

The item type can be any scalar keyword (including aliases). If omitted, defaults to `string`.

***

Examples [#examples]

**Basic fields with types:**

```bash
struktur --input article.txt \
  --fields "title, author, published_date, word_count:integer" \
  --model openai/gpt-4o-mini
```

**Enum field:**

```bash
echo "Order #4421 is currently being packed." | \
  struktur --stdin \
  --fields "order_id, status:enum{pending|processing|shipped|delivered}" \
  --model anthropic/claude-3-5-haiku-20241022
```

**Mixed types including arrays:**

```bash
struktur --input product.html \
  --fields "name, price:float, in_stock:bool, tags:array{string}, category:enum{electronics|clothing|food}" \
  --model openai/gpt-4o-mini
```

**Piped from stdin, output to file:**

```bash
cat reviews.txt | \
  struktur --stdin \
  --fields "sentiment:enum{positive|neutral|negative}, score:int, summary" \
  --model openai/gpt-4o-mini \
  --output result.json
```

**Batch processing a directory:**

```bash
for f in docs/*.txt; do
  struktur --input "$f" \
    --fields "title, category:enum{invoice|receipt|contract}, amount:float" \
    --model openai/gpt-4o-mini \
    --output "out/$(basename "$f" .txt).json"
done
```

***

Generated schema [#generated-schema]

`--fields "title, price:number, tags:array"` produces this schema internally:

```json
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
```

All fields are required. For optional fields, nested objects, or `$ref`, use `--schema` instead.

***

SDK Usage [#sdk-usage]

The `fields` parameter is also available in the SDK:

```ts
import { extract, simple } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  fields: "title, author, year:integer, genre:enum{fiction|nonfiction|reference}",
  strategy: simple({ model: openai("gpt-4o-mini") }),
});

// result.data is typed as Record<string, unknown> when using fields
console.log(result.data.title);
```

For full TypeScript inference on `result.data`, use `schema` with `JSONSchemaType<T>` instead.

Utility exports [#utility-exports]

The parser and schema builder are exported for use outside of `extract()`:

```ts
import {
  parseFieldsString,
  buildSchemaFromParsedFields,
  buildSchemaFromFields,
} from "@struktur/sdk";

// Parse to an intermediate representation
const parsed = parseFieldsString("title, price:number, status:enum{draft|live}");
// [
//   { name: "title",  kind: "scalar", type: "string" },
//   { name: "price",  kind: "scalar", type: "number" },
//   { name: "status", kind: "enum",   values: ["draft", "live"] }
// ]

// Build a schema directly
const schema = buildSchemaFromFields("title, price:number");
```

parseFieldsString(fields: string): ParsedField[] [#parsefieldsstringfields-string-parsedfield]

Parses the fields string into an array of `ParsedField` discriminated union entries:

```ts
type ParsedField =
  | { name: string; kind: "scalar"; type: ScalarFieldType }
  | { name: string; kind: "enum";   values: string[] }
  | { name: string; kind: "array";  items: ScalarFieldType };

type ScalarFieldType = "string" | "number" | "boolean" | "integer" | "int";
```

buildSchemaFromParsedFields(fields: ParsedField[]): AnyJSONSchema [#buildschemafromparsedfieldsfields-parsedfield-anyjsonschema]

Builds the JSON Schema object from a pre-parsed array. Useful if you want to inspect or modify the parsed fields before building.

buildSchemaFromFields(fields: string): AnyJSONSchema [#buildschemafromfieldsfields-string-anyjsonschema]

Convenience one-liner: parses and builds in a single call.

***

Error messages [#error-messages]

Bad field definitions fail immediately with a helpful message:

```bash
--fields "count:bigint"
# Error: Unknown type "bigint" for field "count".
#        Scalar types: bool, boolean, float, int, integer, number, string.
#        Complex types: enum{a|b|c}, array{string}, or array (shorthand for array{string}).

--fields "role:enum{admin}"
# Error: enum for field "role" must have at least two values separated by "|", got: "admin".

--fields "tags:array{}"
# Error: array for field "tags" requires an item type, e.g. array{string}.

--fields "name:enum{a|b"
# Error: Unmatched braces in fields string.
```

***

When to use --fields vs --schema [#when-to-use---fields-vs---schema]

| Situation                                  | Use                                 |
| ------------------------------------------ | ----------------------------------- |
| Quick one-liner or experiment              | `--fields`                          |
| All fields are flat, all required          | `--fields`                          |
| Need optional properties or nested objects | `--schema`                          |
| Schema is reused across many runs          | `--schema`                          |
| Need `$ref`, `allOf`, custom formats       | `--schema`                          |
| Need TypeScript inference on `result.data` | `--schema` with `JSONSchemaType<T>` |

***

See also [#see-also]

* [extract](/docs/cli/extract) — full CLI flag reference
