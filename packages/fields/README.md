# @struktur/fields

> Standalone shorthand JSON Schema builder.
>
> Part of the [Struktur](https://struktur.sh) project — a structured data extraction toolkit.

`@struktur/fields` turns a concise comma-separated string like `title, price:number, tags:array` into a valid JSON Schema object. Zero dependencies, zero coupling to Struktur internals. Use it anywhere you need a quick way to generate schemas from a human-readable DSL.

For full documentation with CLI examples and advanced usage, see the [Fields Shorthand guide](https://struktur.sh/docs/cli/fields) on the Struktur documentation site.

---

## Install

```bash
bun add @struktur/fields
# or
npm install @struktur/fields
```

## API

### `buildSchemaFromFields(fields: string): Record<string, unknown>`

Parse a fields string and build a JSON Schema object in one step.

```ts
import { buildSchemaFromFields } from "@struktur/fields";

const schema = buildSchemaFromFields("title, price:number, status:enum{draft|live}, tags:array");
// =>
// {
//   type: "object",
//   properties: {
//     title:  { type: "string" },
//     price:  { type: "number" },
//     status: { type: "string", enum: ["draft", "live"] },
//     tags:   { type: "array", items: { type: "string" } }
//   },
//   required: ["title", "price", "status", "tags"],
//   additionalProperties: false
// }
```

### `parseFieldsString(fields: string): ParsedField[]`

Parse a fields string into an intermediate array of structured tokens.

```ts
import { parseFieldsString } from "@struktur/fields";

const parsed = parseFieldsString("name, age:int, roles:array{string}");
// => [
//   { name: "name",  kind: "scalar", type: "string" },
//   { name: "age",   kind: "scalar", type: "int" },
//   { name: "roles", kind: "array",  items: "string" }
// ]
```

### `buildSchemaFromParsedFields(fields: ParsedField[]): Record<string, unknown>`

Build a JSON Schema object from a pre-parsed array of `ParsedField` entries. Useful if you want to inspect or modify the parsed fields before building.

```ts
import { parseFieldsString, buildSchemaFromParsedFields } from "@struktur/fields";

const parsed = parseFieldsString("name, email");
// modify or validate parsed here
const schema = buildSchemaFromParsedFields(parsed);
```

---

## Type syntax

```
fields = field ("," field)*
field  = name
       | name ":" type
```

Whitespace around commas and colons is ignored.

### Scalar types

| Keyword | Alias | Schema output |
|---------|-------|---------------|
| `string` | — | `{ type: "string" }` |
| `number` | `float` | `{ type: "number" }` |
| `integer` | — | `{ type: "integer" }` |
| `int` | — | `{ type: "integer", multipleOf: 1 }` |
| `boolean` | `bool` | `{ type: "boolean" }` |

Omitting the type defaults to `string`.

### Enums

```
status:enum{draft|published|archived}
```

Values are separated by `|`. At least two values are required.

### Arrays

```
tags:array              # shorthand for array{string}
tags:array{string}
scores:array{float}
ids:array{int}
```

The item type can be any scalar keyword (including aliases). If omitted, defaults to `string`.

---

## Types

```ts
type ScalarFieldType = "string" | "number" | "boolean" | "integer" | "int";

type ParsedField =
  | { name: string; kind: "scalar"; type: ScalarFieldType }
  | { name: string; kind: "enum";   values: string[] }
  | { name: string; kind: "array";  items: ScalarFieldType };
```

`FieldType` is a legacy alias for `ScalarFieldType`.

---

## Error messages

Bad field definitions fail immediately with a helpful message:

```ts
buildSchemaFromFields("count:bigint");
// Error: Unknown type "bigint" for field "count".
//        Scalar types: bool, boolean, float, int, integer, number, string.
//        Complex types: enum{a|b|c}, array{string}, or array (shorthand for array{string}).

buildSchemaFromFields("role:enum{admin}");
// Error: enum for field "role" must have at least two values separated by "|", got: "admin".

buildSchemaFromFields("tags:array{}");
// Error: array for field "tags" requires an item type, e.g. array{string}.

buildSchemaFromFields("name:enum{a|b");
// Error: Unmatched braces in fields string.
```

---

## License

MIT License. Applies only to `@struktur/fields` package, not to the rest of the [struktur.sh](https://struktur.sh) ecosystem.
