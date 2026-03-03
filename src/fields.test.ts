import { test, expect, describe } from "bun:test";
import {
  parseFieldsString,
  buildSchemaFromParsedFields,
  buildSchemaFromFields,
} from "./fields";

// ---------------------------------------------------------------------------
// parseFieldsString — scalars (positive)
// ---------------------------------------------------------------------------

describe("parseFieldsString — scalars", () => {
  test("single field defaults to string", () => {
    expect(parseFieldsString("title")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
    ]);
  });

  test("two fields without types", () => {
    expect(parseFieldsString("title,description")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
      { name: "description", kind: "scalar", type: "string" },
    ]);
  });

  test("explicit :string is same as omitting type", () => {
    expect(parseFieldsString("title:string")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
    ]);
  });

  test("spaces around comma — no types", () => {
    expect(parseFieldsString("title, description")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
      { name: "description", kind: "scalar", type: "string" },
    ]);
  });

  test("spaces around comma and colon", () => {
    expect(parseFieldsString("title , price: number")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
      { name: "price", kind: "scalar", type: "number" },
    ]);
  });

  test("spaces around colon only", () => {
    expect(parseFieldsString("title, price:number")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
      { name: "price", kind: "scalar", type: "number" },
    ]);
  });

  test("all four scalar types", () => {
    expect(parseFieldsString("a:string,b:number,c:boolean,d:integer")).toEqual([
      { name: "a", kind: "scalar", type: "string" },
      { name: "b", kind: "scalar", type: "number" },
      { name: "c", kind: "scalar", type: "boolean" },
      { name: "d", kind: "scalar", type: "integer" },
    ]);
  });

  test("bool is an alias for boolean", () => {
    expect(parseFieldsString("active:bool")).toEqual([
      { name: "active", kind: "scalar", type: "boolean" },
    ]);
  });

  test("float is an alias for number", () => {
    expect(parseFieldsString("ratio:float")).toEqual([
      { name: "ratio", kind: "scalar", type: "number" },
    ]);
  });

  test("int resolves to int (triggers multipleOf:1 in schema)", () => {
    expect(parseFieldsString("count:int")).toEqual([
      { name: "count", kind: "scalar", type: "int" },
    ]);
  });

  test("all aliases together", () => {
    expect(parseFieldsString("n:int,r:float,f:bool")).toEqual([
      { name: "n", kind: "scalar", type: "int" },
      { name: "r", kind: "scalar", type: "number" },
      { name: "f", kind: "scalar", type: "boolean" },
    ]);
  });

  test("many fields, all untyped", () => {
    expect(parseFieldsString("id,name,email,phone,address")).toEqual([
      { name: "id",      kind: "scalar", type: "string" },
      { name: "name",    kind: "scalar", type: "string" },
      { name: "email",   kind: "scalar", type: "string" },
      { name: "phone",   kind: "scalar", type: "string" },
      { name: "address", kind: "scalar", type: "string" },
    ]);
  });

  test("leading/trailing whitespace in entire string is ignored", () => {
    expect(parseFieldsString("  title  ")).toEqual([
      { name: "title", kind: "scalar", type: "string" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// parseFieldsString — scalars (error cases)
// ---------------------------------------------------------------------------

describe("parseFieldsString — scalar errors", () => {
  test("empty string throws with helpful message", () => {
    expect(() => parseFieldsString("")).toThrow("Fields string must not be empty.");
  });

  test("whitespace-only string throws", () => {
    expect(() => parseFieldsString("   ")).toThrow("Fields string must not be empty.");
  });

  test("unknown scalar type names the offending type and field", () => {
    const err = () => parseFieldsString("title:object");
    expect(err).toThrow(/Unknown type "object"/);
    expect(err).toThrow(/field "title"/);
    expect(err).toThrow(/bool, boolean, float, int, integer, number, string/);
  });

  test("unknown type also hints at complex types", () => {
    expect(() => parseFieldsString("x:map")).toThrow(/enum\{/);
    expect(() => parseFieldsString("x:map")).toThrow(/array\{/);
  });

  test("leading comma — empty field name before it", () => {
    expect(() => parseFieldsString(",foo")).toThrow(/Empty field name/);
  });

  test("trailing comma is silently ignored", () => {
    // The brace-depth splitter drops empty trailing tokens — same as most CLIs.
    expect(parseFieldsString("foo,")).toEqual([
      { name: "foo", kind: "scalar", type: "string" },
    ]);
  });

  test("consecutive commas — empty field name between them", () => {
    expect(() => parseFieldsString("foo,,bar")).toThrow(/Empty field name/);
  });

  test("colon with no type mentions the field name", () => {
    const err = () => parseFieldsString("title:");
    expect(err).toThrow(/Empty type/);
    expect(err).toThrow(/"title"/);
  });

  test("colon with whitespace-only type is treated as empty", () => {
    expect(() => parseFieldsString("title: ")).toThrow(/Empty type/);
  });

  test("field name with only a colon and no name", () => {
    expect(() => parseFieldsString(":string")).toThrow(/Empty field name/);
  });
});

// ---------------------------------------------------------------------------
// parseFieldsString — enums (positive)
// ---------------------------------------------------------------------------

describe("parseFieldsString — enums", () => {
  test("two-value enum", () => {
    expect(parseFieldsString("status:enum{draft|published}")).toEqual([
      { name: "status", kind: "enum", values: ["draft", "published"] },
    ]);
  });

  test("three-value enum with numbers (user example)", () => {
    expect(parseFieldsString("wtf:enum{abc|def|123}")).toEqual([
      { name: "wtf", kind: "enum", values: ["abc", "def", "123"] },
    ]);
  });

  test("spaces around pipe values are trimmed", () => {
    expect(parseFieldsString("status:enum{ draft | published | archived }")).toEqual([
      { name: "status", kind: "enum", values: ["draft", "published", "archived"] },
    ]);
  });

  test("enum field preceded by plain field", () => {
    expect(parseFieldsString("name, status:enum{active|inactive}")).toEqual([
      { name: "name",   kind: "scalar", type: "string" },
      { name: "status", kind: "enum", values: ["active", "inactive"] },
    ]);
  });

  test("enum field followed by plain field", () => {
    expect(parseFieldsString("status:enum{a|b}, title")).toEqual([
      { name: "status", kind: "enum", values: ["a", "b"] },
      { name: "title",  kind: "scalar", type: "string" },
    ]);
  });

  test("enum sandwiched between other fields", () => {
    expect(parseFieldsString("id, role:enum{admin|user|guest}, name")).toEqual([
      { name: "id",   kind: "scalar", type: "string" },
      { name: "role", kind: "enum",   values: ["admin", "user", "guest"] },
      { name: "name", kind: "scalar", type: "string" },
    ]);
  });

  test("enum values that look like numbers", () => {
    expect(parseFieldsString("code:enum{1|2|3}")).toEqual([
      { name: "code", kind: "enum", values: ["1", "2", "3"] },
    ]);
  });

  test("enum values with hyphens and underscores", () => {
    expect(parseFieldsString("type:enum{in-progress|not_started|done}")).toEqual([
      { name: "type", kind: "enum", values: ["in-progress", "not_started", "done"] },
    ]);
  });
});

// ---------------------------------------------------------------------------
// parseFieldsString — enums (error cases)
// ---------------------------------------------------------------------------

describe("parseFieldsString — enum errors", () => {
  test("single value enum throws and mentions field name", () => {
    const err = () => parseFieldsString("x:enum{only}");
    expect(err).toThrow(/at least two/);
    expect(err).toThrow(/"x"/);
  });

  test("empty braces throws", () => {
    const err = () => parseFieldsString("x:enum{}");
    expect(err).toThrow(/at least two/);
  });

  test("braces with only whitespace throws", () => {
    expect(() => parseFieldsString("x:enum{  }")).toThrow(/at least two/);
  });

  test("enum with only pipe separators and no values throws", () => {
    expect(() => parseFieldsString("x:enum{|}")).toThrow(/at least two/);
  });

  test("missing closing brace gives Unmatched braces error", () => {
    expect(() => parseFieldsString("x:enum{a|b")).toThrow(/Unmatched braces/);
  });
});

// ---------------------------------------------------------------------------
// parseFieldsString — arrays (positive)
// ---------------------------------------------------------------------------

describe("parseFieldsString — arrays", () => {
  test("array of string", () => {
    expect(parseFieldsString("tags:array{string}")).toEqual([
      { name: "tags", kind: "array", items: "string" },
    ]);
  });

  test("array of number", () => {
    expect(parseFieldsString("scores:array{number}")).toEqual([
      { name: "scores", kind: "array", items: "number" },
    ]);
  });

  test("array of boolean", () => {
    expect(parseFieldsString("flags:array{boolean}")).toEqual([
      { name: "flags", kind: "array", items: "boolean" },
    ]);
  });

  test("array of integer", () => {
    expect(parseFieldsString("ids:array{integer}")).toEqual([
      { name: "ids", kind: "array", items: "integer" },
    ]);
  });

  test("array of int", () => {
    expect(parseFieldsString("ids:array{int}")).toEqual([
      { name: "ids", kind: "array", items: "int" },
    ]);
  });

  test("array of bool", () => {
    expect(parseFieldsString("flags:array{bool}")).toEqual([
      { name: "flags", kind: "array", items: "boolean" },
    ]);
  });

  test("array of float", () => {
    expect(parseFieldsString("scores:array{float}")).toEqual([
      { name: "scores", kind: "array", items: "number" },
    ]);
  });

  test("array preceded by plain field (user example)", () => {
    expect(parseFieldsString("name, addresses:array{string}")).toEqual([
      { name: "name",      kind: "scalar", type: "string" },
      { name: "addresses", kind: "array",  items: "string" },
    ]);
  });

  test("array followed by plain field", () => {
    expect(parseFieldsString("tags:array{string}, title")).toEqual([
      { name: "tags",  kind: "array",  items: "string" },
      { name: "title", kind: "scalar", type: "string" },
    ]);
  });

  test("whitespace inside braces is trimmed", () => {
    expect(parseFieldsString("tags:array{ string }")).toEqual([
      { name: "tags", kind: "array", items: "string" },
    ]);
  });
});

// ---------------------------------------------------------------------------
// parseFieldsString — arrays (error cases)
// ---------------------------------------------------------------------------

describe("parseFieldsString — array errors", () => {
  test("unknown item type names the offending type and field", () => {
    const err = () => parseFieldsString("x:array{object}");
    expect(err).toThrow(/Unknown type "object"/);
    expect(err).toThrow(/field "x"/);
  });

  test("empty braces throws with field name", () => {
    const err = () => parseFieldsString("x:array{}");
    expect(err).toThrow(/requires an item type/);
    expect(err).toThrow(/"x"/);
  });

  test("whitespace-only braces throws", () => {
    expect(() => parseFieldsString("x:array{  }")).toThrow(/requires an item type/);
  });

  test("missing closing brace gives Unmatched braces error", () => {
    expect(() => parseFieldsString("x:array{string")).toThrow(/Unmatched braces/);
  });
});

// ---------------------------------------------------------------------------
// parseFieldsString — brace depth / structural errors
// ---------------------------------------------------------------------------

describe("parseFieldsString — structural errors", () => {
  test("unmatched open brace throws", () => {
    expect(() => parseFieldsString("x:array{string, y")).toThrow(/Unmatched braces/);
  });
});

// ---------------------------------------------------------------------------
// buildSchemaFromParsedFields
// ---------------------------------------------------------------------------

describe("buildSchemaFromParsedFields", () => {
  test("single string field", () => {
    expect(buildSchemaFromParsedFields([
      { name: "title", kind: "scalar", type: "string" },
    ])).toEqual({
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
      additionalProperties: false,
    });
  });

  test("two scalar fields", () => {
    expect(buildSchemaFromParsedFields([
      { name: "title", kind: "scalar", type: "string" },
      { name: "price", kind: "scalar", type: "number" },
    ])).toEqual({
      type: "object",
      properties: {
        title: { type: "string" },
        price: { type: "number" },
      },
      required: ["title", "price"],
      additionalProperties: false,
    });
  });

  test("enum field produces string type with enum array", () => {
    expect(buildSchemaFromParsedFields([
      { name: "status", kind: "enum", values: ["draft", "published"] },
    ])).toEqual({
      type: "object",
      properties: {
        status: { type: "string", enum: ["draft", "published"] },
      },
      required: ["status"],
      additionalProperties: false,
    });
  });

  test("array field produces array type with items", () => {
    expect(buildSchemaFromParsedFields([
      { name: "tags", kind: "array", items: "string" },
    ])).toEqual({
      type: "object",
      properties: {
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["tags"],
      additionalProperties: false,
    });
  });

  test("all three kinds together", () => {
    expect(buildSchemaFromParsedFields([
      { name: "title",  kind: "scalar", type: "string" },
      { name: "status", kind: "enum",   values: ["a", "b"] },
      { name: "tags",   kind: "array",  items: "string" },
    ])).toEqual({
      type: "object",
      properties: {
        title:  { type: "string" },
        status: { type: "string", enum: ["a", "b"] },
        tags:   { type: "array", items: { type: "string" } },
      },
      required: ["title", "status", "tags"],
      additionalProperties: false,
    });
  });

  test("int field produces integer type with multipleOf:1", () => {
    expect(buildSchemaFromParsedFields([
      { name: "count", kind: "scalar", type: "int" },
    ])).toEqual({
      type: "object",
      properties: { count: { type: "integer", multipleOf: 1 } },
      required: ["count"],
      additionalProperties: false,
    });
  });

  test("float field produces plain number type (no multipleOf)", () => {
    expect(buildSchemaFromParsedFields([
      { name: "ratio", kind: "scalar", type: "number" },
    ])).toEqual({
      type: "object",
      properties: { ratio: { type: "number" } },
      required: ["ratio"],
      additionalProperties: false,
    });
  });

  test("array of int items produces integer items with multipleOf:1", () => {
    expect(buildSchemaFromParsedFields([
      { name: "ids", kind: "array", items: "int" },
    ])).toEqual({
      type: "object",
      properties: { ids: { type: "array", items: { type: "integer", multipleOf: 1 } } },
      required: ["ids"],
      additionalProperties: false,
    });
  });
  test("throws on empty array with helpful message", () => {
    expect(() => buildSchemaFromParsedFields([])).toThrow(
      "Cannot build a schema from an empty fields list.",
    );
  });
});

// ---------------------------------------------------------------------------
// buildSchemaFromFields (end-to-end convenience wrapper)
// ---------------------------------------------------------------------------

describe("buildSchemaFromFields", () => {
  test("single untyped field", () => {
    expect(buildSchemaFromFields("title")).toEqual({
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
      additionalProperties: false,
    });
  });

  test("two untyped fields", () => {
    expect(buildSchemaFromFields("title,description")).toEqual({
      type: "object",
      properties: {
        title:       { type: "string" },
        description: { type: "string" },
      },
      required: ["title", "description"],
      additionalProperties: false,
    });
  });

  test("mixed scalar types", () => {
    expect(buildSchemaFromFields("title, price:number")).toEqual({
      type: "object",
      properties: {
        title: { type: "string" },
        price: { type: "number" },
      },
      required: ["title", "price"],
      additionalProperties: false,
    });
  });

  test("enum (user example: name,wtf:enum{abc|def|123})", () => {
    expect(buildSchemaFromFields("name,wtf:enum{abc|def|123}")).toEqual({
      type: "object",
      properties: {
        name: { type: "string" },
        wtf:  { type: "string", enum: ["abc", "def", "123"] },
      },
      required: ["name", "wtf"],
      additionalProperties: false,
    });
  });

  test("array (user example: name,addresses:array{string})", () => {
    expect(buildSchemaFromFields("name,addresses:array{string}")).toEqual({
      type: "object",
      properties: {
        name:      { type: "string" },
        addresses: { type: "array", items: { type: "string" } },
      },
      required: ["name", "addresses"],
      additionalProperties: false,
    });
  });

  test("all four types in one string", () => {
    expect(buildSchemaFromFields(
      "title, price:number, status:enum{a|b}, tags:array{string}",
    )).toEqual({
      type: "object",
      properties: {
        title:  { type: "string" },
        price:  { type: "number" },
        status: { type: "string", enum: ["a", "b"] },
        tags:   { type: "array", items: { type: "string" } },
      },
      required: ["title", "price", "status", "tags"],
      additionalProperties: false,
    });
  });

  test("realistic product schema", () => {
    expect(buildSchemaFromFields(
      "id, name, price:number, in_stock:boolean, tags:array{string}, condition:enum{new|used|refurbished}",
    )).toEqual({
      type: "object",
      properties: {
        id:        { type: "string" },
        name:      { type: "string" },
        price:     { type: "number" },
        in_stock:  { type: "boolean" },
        tags:      { type: "array", items: { type: "string" } },
        condition: { type: "string", enum: ["new", "used", "refurbished"] },
      },
      required: ["id", "name", "price", "in_stock", "tags", "condition"],
      additionalProperties: false,
    });
  });

  test("realistic article schema", () => {
    expect(buildSchemaFromFields(
      "title, author, word_count:integer, published:boolean, status:enum{draft|review|published}",
    )).toEqual({
      type: "object",
      properties: {
        title:      { type: "string" },
        author:     { type: "string" },
        word_count: { type: "integer" },
        published:  { type: "boolean" },
        status:     { type: "string", enum: ["draft", "review", "published"] },
      },
      required: ["title", "author", "word_count", "published", "status"],
      additionalProperties: false,
    });
  });

  test("numeric-looking enum values stay as strings in schema", () => {
    const schema = buildSchemaFromFields("rating:enum{1|2|3|4|5}") as {
      properties: { rating: { enum: unknown[] } };
    };
    expect(schema.properties.rating.enum).toEqual(["1", "2", "3", "4", "5"]);
  });
});

// ---------------------------------------------------------------------------
// extract() mutual-exclusion guard
// ---------------------------------------------------------------------------

describe("extract() schema mutual exclusion", () => {
  const mockStrategy = () => ({
    name: "mock",
    run: async () => ({
      data: {},
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    }),
  });

  test("error message tells you they are mutually exclusive", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      schema: { type: "object", properties: {}, required: [] },
      fields: "title",
      strategy: mockStrategy(),
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toMatch(/mutually exclusive/);
  });

  test("error message when neither schema nor fields are provided", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      strategy: mockStrategy(),
    } as Parameters<typeof extract>[0]);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toMatch(/schema definition is required/);
    // Tells you what to use instead
    expect(result.error?.message).toMatch(/`schema`/);
    expect(result.error?.message).toMatch(/`fields`/);
  });

  test("succeeds with only schema", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      schema: { type: "object", properties: {}, required: [] },
      strategy: mockStrategy(),
    });
    expect(result.error).toBeUndefined();
  });

  test("succeeds with only fields string", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      fields: "title",
      strategy: mockStrategy(),
    });
    expect(result.error).toBeUndefined();
  });

  test("succeeds with fields including enum and array", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      fields: "title, status:enum{a|b}, tags:array{string}",
      strategy: mockStrategy(),
    });
    expect(result.error).toBeUndefined();
  });

  test("invalid fields string surfaces as error on result", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      fields: "title:badtype",
      strategy: mockStrategy(),
    });
    expect(result.error).toBeDefined();
    expect(result.error?.message).toMatch(/Unknown type "badtype"/);
  });
});
