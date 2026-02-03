import { test, expect } from "bun:test";
import type { JSONSchemaType } from "ajv";
import { createAjv, validateOrThrow, SchemaValidationError } from "./validator";

type Person = {
  name: string;
  age: number;
};

const personSchema: JSONSchemaType<Person> = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
  required: ["name", "age"],
  additionalProperties: false,
};

test("validateOrThrow returns typed data for valid input", () => {
  const ajv = createAjv();
  const data = validateOrThrow<Person>(ajv, personSchema, {
    name: "Ada",
    age: 33,
  });

  expect(data.name).toBe("Ada");
  expect(data.age).toBe(33);
});

test("validateOrThrow throws SchemaValidationError for invalid input", () => {
  const ajv = createAjv();
  try {
    validateOrThrow<Person>(ajv, personSchema, { name: "Ada" });
    throw new Error("Expected validation error");
  } catch (error) {
    expect(error).toBeInstanceOf(SchemaValidationError);
    const validationError = error as SchemaValidationError;
    expect(validationError.errors.length).toBeGreaterThan(0);
  }
});

test("createAjv supports common formats", () => {
  const ajv = createAjv();
  const schema: JSONSchemaType<string> = { type: "string", format: "email" };

  const data = validateOrThrow<string>(ajv, schema, "test@example.com");
  expect(data).toBe("test@example.com");

  try {
    validateOrThrow<string>(ajv, schema, "not-an-email");
    throw new Error("Expected validation error");
  } catch (error) {
    expect(error).toBeInstanceOf(SchemaValidationError);
  }
});
