import { test, expect, describe } from "bun:test";
import { z } from "zod";
import {
  createValidator,
  isRequiredError,
  isStandardSchema,
  toJsonSchema,
  SchemaValidationError,
  type ValidationIssue,
  type StandardSchema,
} from "./validator";

// ---------------------------------------------------------------------------
// Shared test schemas
// ---------------------------------------------------------------------------

const personJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name", "age"],
  additionalProperties: false,
};

const personZodSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// A minimal hand-rolled Standard Schema implementation for testing non-Zod paths
function makeStandardSchema<T>(
  validateFn: (v: unknown) => { value: T } | { issues: { message: string }[] },
): StandardSchema<unknown, T> {
  return {
    "~standard": {
      version: 1 as const,
      vendor: "test-vendor",
      validate: validateFn,
    },
  };
}

// ---------------------------------------------------------------------------
// isStandardSchema
// ---------------------------------------------------------------------------

describe("isStandardSchema", () => {
  test("returns true for Zod schema", () => {
    expect(isStandardSchema(z.string())).toBe(true);
    expect(isStandardSchema(z.object({ x: z.number() }))).toBe(true);
  });

  test("returns true for a hand-rolled Standard Schema", () => {
    const schema = makeStandardSchema<string>((v) => ({ value: v as string }));
    expect(isStandardSchema(schema)).toBe(true);
  });

  test("returns false for plain objects", () => {
    expect(isStandardSchema({ type: "string" })).toBe(false);
    expect(isStandardSchema({})).toBe(false);
    expect(isStandardSchema(null)).toBe(false);
    expect(isStandardSchema(undefined)).toBe(false);
    expect(isStandardSchema("string")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toJsonSchema
// ---------------------------------------------------------------------------

describe("toJsonSchema", () => {
  test("returns plain object unchanged", () => {
    const schema = { type: "object", properties: { x: { type: "number" } } };
    expect(toJsonSchema(schema)).toEqual(schema);
  });

  test("extracts JSON Schema from a Zod schema", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const json = toJsonSchema(schema);
    expect(json).toMatchObject({ type: "object" });
    expect((json as { properties?: unknown }).properties).toBeDefined();
  });

  test("extracts JSON Schema from a Standard JSON Schema implementation", () => {
    const jsonSchemaOutput = { type: "object", properties: { x: { type: "string" } } };
    const schema: StandardSchema & {
      "~standard": { jsonSchema: { output: (o: { target: string }) => typeof jsonSchemaOutput } };
    } = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: (v) => ({ value: v }),
        jsonSchema: { output: () => jsonSchemaOutput },
      },
    };
    expect(toJsonSchema(schema)).toEqual(jsonSchemaOutput);
  });
});

// ---------------------------------------------------------------------------
// isRequiredError
// ---------------------------------------------------------------------------

describe("isRequiredError", () => {
  test("returns true for required keyword", () => {
    const issue: ValidationIssue = { message: "required", keyword: "required" };
    expect(isRequiredError(issue)).toBe(true);
  });

  test("returns false for type keyword", () => {
    const issue: ValidationIssue = { message: "invalid type", keyword: "type" };
    expect(isRequiredError(issue)).toBe(false);
  });

  test("returns false for no keyword", () => {
    const issue: ValidationIssue = { message: "something" };
    expect(isRequiredError(issue)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createValidator — JSON Schema path
// ---------------------------------------------------------------------------

describe("createValidator (JSON Schema)", () => {
  test("validateOrThrow returns typed data for valid input", () => {
    const v = createValidator(personJsonSchema);
    const result = v.validateOrThrow<{ name: string; age: number }>({ name: "Ada", age: 33 });
    expect(result.name).toBe("Ada");
    expect(result.age).toBe(33);
  });

  test("validateOrThrow throws SchemaValidationError for missing required field", () => {
    const v = createValidator(personJsonSchema);
    expect(() => v.validateOrThrow({ name: "Ada" })).toThrow(SchemaValidationError);
  });

  test("validateOrThrow throws SchemaValidationError for wrong type", () => {
    const v = createValidator(personJsonSchema);
    expect(() => v.validateOrThrow({ name: "Ada", age: "thirty-three" })).toThrow(
      SchemaValidationError,
    );
  });

  test("errors carry keyword for type mismatch", () => {
    const v = createValidator(personJsonSchema);
    try {
      v.validateOrThrow({ name: "Ada", age: "bad" });
    } catch (err) {
      expect(err).toBeInstanceOf(SchemaValidationError);
      const e = err as SchemaValidationError;
      expect(e.errors.some((i) => i.keyword === "type")).toBe(true);
    }
  });

  test("errors carry 'required' keyword for missing fields", () => {
    const v = createValidator(personJsonSchema);
    try {
      v.validateOrThrow({ name: "Ada" });
    } catch (err) {
      expect(err).toBeInstanceOf(SchemaValidationError);
      const e = err as SchemaValidationError;
      expect(e.errors.some((i) => isRequiredError(i))).toBe(true);
    }
  });

  test("validateOrThrow supports string format: email", () => {
    const schema = { type: "object", properties: { email: { type: "string", format: "email" } }, required: ["email"] };
    const v = createValidator(schema);
    const result = v.validateOrThrow<{ email: string }>({ email: "test@example.com" });
    expect(result.email).toBe("test@example.com");
    expect(() => v.validateOrThrow({ email: "not-an-email" })).toThrow(SchemaValidationError);
  });

  test("validateOrThrow supports artifact-id format via pattern rewrite", () => {
    const schema = { type: "string", format: "artifact-id" };
    const v = createValidator(schema);

    expect(v.validateOrThrow<string>("artifact:123456/images/image1.jpg")).toBe(
      "artifact:123456/images/image1.jpg",
    );
    expect(v.validateOrThrow<string>("artifact:abc-xyz/images/image10.png")).toBe(
      "artifact:abc-xyz/images/image10.png",
    );
    expect(() => v.validateOrThrow("not-an-artifact-id")).toThrow(SchemaValidationError);
    expect(() => v.validateOrThrow("https://example.com/image.jpg")).toThrow(SchemaValidationError);
  });

  test("validateAllowingMissingRequired accepts data with only required-field errors (final attempt)", () => {
    const v = createValidator(personJsonSchema);
    const result = v.validateAllowingMissingRequired<{ name: string; age?: number }>(
      { name: "Ada" },
      true,
    );
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.data.name).toBe("Ada");
  });

  test("validateAllowingMissingRequired rejects data with only required-field errors on non-final attempt", () => {
    const v = createValidator(personJsonSchema);
    const result = v.validateAllowingMissingRequired({ name: "Ada" }, false);
    expect(result.valid).toBe(false);
  });

  test("validateAllowingMissingRequired rejects data with type errors regardless of attempt", () => {
    const v = createValidator(personJsonSchema);
    const resultNonFinal = v.validateAllowingMissingRequired({ name: "Ada", age: "bad" }, false);
    expect(resultNonFinal.valid).toBe(false);

    const resultFinal = v.validateAllowingMissingRequired({ name: "Ada", age: "bad" }, true);
    expect(resultFinal.valid).toBe(false);

    if (!resultFinal.valid) {
      expect(resultFinal.errors.some((i) => i.keyword === "type")).toBe(true);
    }
  });

  test("validateAllowingMissingRequired accepts fully valid data", () => {
    const v = createValidator(personJsonSchema);
    const result = v.validateAllowingMissingRequired<{ name: string; age: number }>(
      { name: "Ada", age: 33 },
      false,
    );
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.name).toBe("Ada");
      expect(result.data.age).toBe(33);
    }
  });

  test("handles nested schemas", () => {
    const schema = {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
          required: ["name", "email"],
        },
        items: { type: "array", items: { type: "string" } },
      },
      required: ["user", "items"],
    };
    const v = createValidator(schema);

    // Type error in nested field should fail even on final attempt
    const result = v.validateAllowingMissingRequired(
      { user: { name: "Ada", email: "not-email" }, items: ["a"] },
      true,
    );
    expect(result.valid).toBe(false);
  });

  test("caches compiled schema across multiple calls", () => {
    const v = createValidator(personJsonSchema);
    // Call multiple times — should not throw from re-compilation
    v.validateOrThrow({ name: "A", age: 1 });
    v.validateOrThrow({ name: "B", age: 2 });
    v.validateOrThrow({ name: "C", age: 3 });
  });

  test("array schema", () => {
    const schema = { type: "array", items: { type: "string" } };
    const v = createValidator(schema);
    const result = v.validateOrThrow<string[]>(["a", "b", "c"]);
    expect(result).toEqual(["a", "b", "c"]);
    expect(() => v.validateOrThrow([1, 2, 3])).toThrow(SchemaValidationError);
  });

  test("string schema", () => {
    const v = createValidator({ type: "string" });
    expect(v.validateOrThrow<string>("hello")).toBe("hello");
    expect(() => v.validateOrThrow(42)).toThrow(SchemaValidationError);
  });

  test("number schema", () => {
    const v = createValidator({ type: "number" });
    expect(v.validateOrThrow<number>(42)).toBe(42);
    expect(() => v.validateOrThrow("not a number")).toThrow(SchemaValidationError);
  });
});

// ---------------------------------------------------------------------------
// createValidator — Zod schema path
// ---------------------------------------------------------------------------

describe("createValidator (Zod schema)", () => {
  test("validateOrThrow returns typed data for valid input", () => {
    const v = createValidator(personZodSchema);
    const result = v.validateOrThrow<{ name: string; age: number }>({ name: "Ada", age: 33 });
    expect(result.name).toBe("Ada");
    expect(result.age).toBe(33);
  });

  test("validateOrThrow throws SchemaValidationError for invalid input", () => {
    const v = createValidator(personZodSchema);
    expect(() => v.validateOrThrow({ name: "Ada" })).toThrow(SchemaValidationError);
  });

  test("errors have keyword for type errors", () => {
    const v = createValidator(personZodSchema);
    try {
      v.validateOrThrow({ name: 123, age: 33 });
    } catch (err) {
      expect(err).toBeInstanceOf(SchemaValidationError);
      const e = err as SchemaValidationError;
      expect(e.errors.some((i) => i.keyword === "type")).toBe(true);
    }
  });

  test("validateAllowingMissingRequired accepts data with only missing fields (final attempt)", () => {
    const v = createValidator(personZodSchema);
    const result = v.validateAllowingMissingRequired({ name: "Ada" }, true);
    expect(result.valid).toBe(true);
  });

  test("validateAllowingMissingRequired rejects type errors even on final attempt", () => {
    const v = createValidator(personZodSchema);
    const result = v.validateAllowingMissingRequired({ name: 999, age: 33 }, true);
    expect(result.valid).toBe(false);
  });

  test("complex Zod schema with transforms", () => {
    const schema = z.object({
      title: z.string(),
      tags: z.array(z.string()).optional(),
      count: z.number().int().positive(),
    });
    const v = createValidator(schema);
    const result = v.validateOrThrow<{ title: string; count: number }>({
      title: "test",
      count: 5,
    });
    expect(result.title).toBe("test");
    expect(result.count).toBe(5);
  });

  test("Zod schema with string format (email)", () => {
    const schema = z.object({ email: z.string().email() });
    const v = createValidator(schema);
    expect(v.validateOrThrow({ email: "test@example.com" })).toMatchObject({
      email: "test@example.com",
    });
    expect(() => v.validateOrThrow({ email: "not-an-email" })).toThrow(SchemaValidationError);
  });
});

// ---------------------------------------------------------------------------
// createValidator — Standard Schema (non-Zod) path
// ---------------------------------------------------------------------------

describe("createValidator (Standard Schema, non-Zod)", () => {
  test("validateOrThrow returns data on success", () => {
    const schema = makeStandardSchema<{ name: string }>((v) => ({
      value: v as { name: string },
    }));
    const v = createValidator(schema);
    const result = v.validateOrThrow<{ name: string }>({ name: "Ada" });
    expect(result.name).toBe("Ada");
  });

  test("validateOrThrow throws SchemaValidationError on issues", () => {
    const schema = makeStandardSchema<never>((_v) => ({
      issues: [{ message: "Invalid input" }],
    }));
    const v = createValidator(schema);
    expect(() => v.validateOrThrow({})).toThrow(SchemaValidationError);
  });

  test("errors from Standard Schema are forwarded", () => {
    const schema = makeStandardSchema<never>((_v) => ({
      issues: [
        { message: "required field missing", path: [{ key: "name" }] },
        { message: "invalid type on age", path: ["age"] },
      ],
    }));
    const v = createValidator(schema);
    try {
      v.validateOrThrow({});
    } catch (err) {
      expect(err).toBeInstanceOf(SchemaValidationError);
      const e = err as SchemaValidationError;
      expect(e.errors).toHaveLength(2);
      expect(e.errors[0]?.keyword).toBe("required");
      expect(e.errors[1]?.keyword).toBe("type");
    }
  });

  test("validateAllowingMissingRequired accepts on final attempt when only required errors", () => {
    // Only returns a "required" issue
    const schema = makeStandardSchema<{ name: string }>((_v) => ({
      issues: [{ message: "required" }],
    }));
    const v = createValidator(schema);
    const result = v.validateAllowingMissingRequired({ name: "Ada" }, true);
    expect(result.valid).toBe(true);
  });

  test("validateAllowingMissingRequired rejects non-required errors always", () => {
    const schema = makeStandardSchema<never>((_v) => ({
      issues: [{ message: "invalid type" }],
    }));
    const v = createValidator(schema);
    const resultFinal = v.validateAllowingMissingRequired({}, true);
    const resultNonFinal = v.validateAllowingMissingRequired({}, false);
    expect(resultFinal.valid).toBe(false);
    expect(resultNonFinal.valid).toBe(false);
  });

  test("throws for async Standard Schema validate()", () => {
    const schema: StandardSchema = {
      "~standard": {
        version: 1,
        vendor: "async-test",
        validate: async (_v) => ({ value: _v }),
      },
    };
    const v = createValidator(schema);
    expect(() => v.validateOrThrow({})).toThrow(
      "Async Standard Schema validation is not supported",
    );
  });
});

// ---------------------------------------------------------------------------
// SchemaValidationError
// ---------------------------------------------------------------------------

describe("SchemaValidationError", () => {
  test("is an Error with name SchemaValidationError", () => {
    const err = new SchemaValidationError("bad", [{ message: "x" }]);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("SchemaValidationError");
    expect(err.message).toBe("bad");
    expect(err.errors).toHaveLength(1);
  });
});
