import Ajv, { type AnySchema, type ErrorObject, type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

export type ValidationErrors = ErrorObject[];

export class SchemaValidationError extends Error {
  public readonly errors: ValidationErrors;

  constructor(message: string, errors: ValidationErrors) {
    super(message);
    this.name = "SchemaValidationError";
    this.errors = errors;
  }
}

export const createAjv = () => {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });
  addFormats(ajv);
  return ajv;
};

export type SchemaInput<T> = JSONSchemaType<T> | AnySchema;

export const validateOrThrow = <T>(
  ajv: Ajv,
  schema: SchemaInput<T>,
  data: unknown
): T => {
  const validate = ajv.compile<T>(schema);
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors ?? [];
    const message = "Schema validation failed";
    throw new SchemaValidationError(message, errors);
  }

  return data as T;
};
