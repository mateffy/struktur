import { test, expect, describe } from "bun:test";
import {
  parseFieldsString,
  buildSchemaFromParsedFields,
  buildSchemaFromFields,
} from "./fields";

// ---------------------------------------------------------------------------
// parseFieldsString
// ---------------------------------------------------------------------------

describe("parseFieldsString", () => {
  test("single field defaults to string", () => {
    expect(parseFieldsString("title")).toEqual([
      { name: "title", type: "string" },
    ]);
  });

  test("two fields without types", () => {
    expect(parseFieldsString("title,description")).toEqual([
      { name: "title", type: "string" },
      { name: "description", type: "string" },
    ]);
  });

  test("spaces around comma and name (user examples)", () => {
    expect(parseFieldsString("title, description")).toEqual([
      { name: "title", type: "string" },
      { name: "description", type: "string" },
    ]);

    expect(parseFieldsString("title , price: number")).toEqual([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
    ]);

    expect(parseFieldsString("title, price:number")).toEqual([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
    ]);
  });

  test("all supported types", () => {
    expect(parseFieldsString("a:string,b:number,c:boolean,d:integer")).toEqual([
      { name: "a", type: "string" },
      { name: "b", type: "number" },
      { name: "c", type: "boolean" },
      { name: "d", type: "integer" },
    ]);
  });

  test("mixed typed and untyped", () => {
    expect(parseFieldsString("title, price:number")).toEqual([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
    ]);
  });

  test("throws on empty string", () => {
    expect(() => parseFieldsString("")).toThrow();
    expect(() => parseFieldsString("   ")).toThrow();
  });

  test("throws on unknown type", () => {
    expect(() => parseFieldsString("title:object")).toThrow(/Unknown type/);
  });

  test("throws on empty field name", () => {
    expect(() => parseFieldsString(",foo")).toThrow();
  });

  test("throws on colon with no type", () => {
    expect(() => parseFieldsString("title:")).toThrow(/Empty type/);
  });
});

// ---------------------------------------------------------------------------
// buildSchemaFromParsedFields
// ---------------------------------------------------------------------------

describe("buildSchemaFromParsedFields", () => {
  test("builds object schema", () => {
    const schema = buildSchemaFromParsedFields([
      { name: "title", type: "string" },
      { name: "price", type: "number" },
    ]);
    expect(schema).toEqual({
      type: "object",
      properties: {
        title: { type: "string" },
        price: { type: "number" },
      },
      required: ["title", "price"],
      additionalProperties: false,
    });
  });

  test("throws on empty array", () => {
    expect(() => buildSchemaFromParsedFields([])).toThrow();
  });
});

// ---------------------------------------------------------------------------
// buildSchemaFromFields (convenience wrapper)
// ---------------------------------------------------------------------------

describe("buildSchemaFromFields", () => {
  test("title,description → string schema", () => {
    const schema = buildSchemaFromFields("title,description");
    expect(schema).toEqual({
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
      },
      required: ["title", "description"],
      additionalProperties: false,
    });
  });

  test("title, price:number → mixed schema", () => {
    const schema = buildSchemaFromFields("title, price:number");
    expect(schema).toEqual({
      type: "object",
      properties: {
        title: { type: "string" },
        price: { type: "number" },
      },
      required: ["title", "price"],
      additionalProperties: false,
    });
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

  test("throws when both schema and fields are provided", async () => {
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

  test("throws when neither schema nor fields are provided", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      strategy: mockStrategy(),
    } as Parameters<typeof extract>[0]);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toMatch(/schema definition is required/);
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

  test("succeeds with only fields", async () => {
    const { extract } = await import("./extract");
    const result = await extract({
      artifacts: [],
      fields: "title",
      strategy: mockStrategy(),
    });
    expect(result.error).toBeUndefined();
  });
});
