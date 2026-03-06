import { test, expect } from "bun:test";
import type { JSONSchemaType, ErrorObject } from "ajv";
import { createAjv, validateOrThrow, SchemaValidationError, isRequiredError, validateAllowingMissingRequired } from "./validator";

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

type NestedSchema = {
  user: {
    name: string;
    email: string;
  };
  items: string[];
};

const nestedSchema: JSONSchemaType<NestedSchema> = {
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
    items: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["user", "items"],
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

test("createAjv supports artifact-id format", () => {
  const ajv = createAjv();
  const schema: JSONSchemaType<string> = { type: "string", format: "artifact-id" };

  const validData = validateOrThrow<string>(ajv, schema, "artifact:123456/images/image1.jpg");
  expect(validData).toBe("artifact:123456/images/image1.jpg");

  const validData2 = validateOrThrow<string>(ajv, schema, "artifact:abc-xyz/images/image10.png");
  expect(validData2).toBe("artifact:abc-xyz/images/image10.png");

  try {
    validateOrThrow<string>(ajv, schema, "not-an-artifact-id");
    throw new Error("Expected validation error");
  } catch (error) {
    expect(error).toBeInstanceOf(SchemaValidationError);
  }

  try {
    validateOrThrow<string>(ajv, schema, "artifact:123/images/image");
    throw new Error("Expected validation error");
  } catch (error) {
    expect(error).toBeInstanceOf(SchemaValidationError);
  }

  try {
    validateOrThrow<string>(ajv, schema, "https://example.com/image.jpg");
    throw new Error("Expected validation error");
  } catch (error) {
    expect(error).toBeInstanceOf(SchemaValidationError);
  }
});

test("isRequiredError identifies required constraint violations", () => {
  const requiredError = { 
    keyword: "required", 
    params: { missingProperty: "name" },
    instancePath: "",
    schemaPath: "#/required"
  } as unknown as ErrorObject;
  const typeError = { 
    keyword: "type", 
    params: { type: "string" },
    instancePath: "/age",
    schemaPath: "#/properties/age/type"
  } as unknown as ErrorObject;
  
  expect(isRequiredError(requiredError)).toBe(true);
  expect(isRequiredError(typeError)).toBe(false);
});

test("validateAllowingMissingRequired ignores required errors but catches type errors", () => {
  const ajv = createAjv();
  
  const resultMissingRequired = validateAllowingMissingRequired<Person>(
    ajv,
    personSchema,
    { name: "Ada" }
  );
  expect(resultMissingRequired.valid).toBe(true);
  if (resultMissingRequired.valid) {
    expect(resultMissingRequired.data.name).toBe("Ada");
  }
  
  const resultTypeError = validateAllowingMissingRequired<Person>(
    ajv,
    personSchema,
    { name: "Ada", age: "thirty-three" }
  );
  expect(resultTypeError.valid).toBe(false);
  if (!resultTypeError.valid) {
    expect(resultTypeError.errors.some(e => e.keyword === "type")).toBe(true);
  }
  
  const resultValid = validateAllowingMissingRequired<Person>(
    ajv,
    personSchema,
    { name: "Ada", age: 33 }
  );
  expect(resultValid.valid).toBe(true);
  if (resultValid.valid) {
    expect(resultValid.data.name).toBe("Ada");
    expect(resultValid.data.age).toBe(33);
  }
});

test("validateAllowingMissingRequired handles format errors", () => {
  const ajv = createAjv();
  
  const result = validateAllowingMissingRequired<NestedSchema>(
    ajv,
    nestedSchema,
    {
      user: { name: "Ada", email: "not-an-email" },
      items: ["a", "b"]
    }
  );
  
  expect(result.valid).toBe(false);
  if (!result.valid) {
    expect(result.errors.some(e => e.keyword === "format")).toBe(true);
  }
});

test("validateAllowingMissingRequired handles nested required field errors", () => {
  const ajv = createAjv();
  
  const result = validateAllowingMissingRequired<NestedSchema>(
    ajv,
    nestedSchema,
    {
      user: { name: "Ada" },
      items: ["a"]
    }
  );
  
  expect(result.valid).toBe(true);
  if (result.valid) {
    expect(result.data.user.name).toBe("Ada");
  }
});
