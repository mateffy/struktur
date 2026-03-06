import Ajv, { type AnySchema, type ErrorObject, type JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";

export type ValidationErrors = ErrorObject[];

export type ValidationMode = 'strict' | 'lenient';

export type ValidationResult<T> = 
  | { valid: true; data: T }
  | { valid: false; errors: ErrorObject[] };

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

export const isRequiredError = (error: ErrorObject): boolean => {
  return error.keyword === "required";
};

export const validateAllowingMissingRequired = <T>(
  ajv: Ajv,
  schema: SchemaInput<T>,
  data: unknown,
  isFinalAttempt: boolean = true
): ValidationResult<T> => {
  const validate = ajv.compile<T>(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true, data: data as T };
  }

  const errors = validate.errors ?? [];
  const nonRequiredErrors = errors.filter((error) => !isRequiredError(error));

  if (nonRequiredErrors.length === 0) {
    // Only required field errors
    // On final attempt, accept partial data
    // On non-final attempts, return invalid to trigger retry
    if (isFinalAttempt) {
      return { valid: true, data: data as T };
    }
    return { valid: false, errors };
  }

  return { valid: false, errors: nonRequiredErrors };
};
