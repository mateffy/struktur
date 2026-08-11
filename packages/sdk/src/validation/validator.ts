import { z } from "zod";

// ---------------------------------------------------------------------------
// Standard Schema V1 spec types (inlined — no external dependency required)
// See: https://standardschema.dev/
// ---------------------------------------------------------------------------

export type StandardSchemaIssue = {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
};

export type StandardSchemaResult<T> =
  | { readonly value: T; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaIssue> };

/**
 * Minimal Standard Schema V1 interface.
 * Implemented by Zod v4, Valibot, ArkType, and other schema libraries.
 * Pass any compliant schema as the `schema` option in `extract()`.
 */
export type StandardSchema<Input = unknown, Output = Input> = {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly types?: { readonly output: Output; readonly input: Input };
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
  };
};

// ---------------------------------------------------------------------------
// Validation result types
// ---------------------------------------------------------------------------

/** Normalized validation issue, independent of the underlying validator. */
export type ValidationIssue = {
  message: string;
  path?: (string | number | symbol)[];
  /**
   * Semantic keyword for the kind of failure — mirrors JSON Schema vocabulary.
   * "required" = missing required field, "type" = wrong type, "format" = format
   * violation, "additionalProperties" = unexpected keys, etc.
   */
  keyword?: string;
};

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: ValidationIssue[] };

export class SchemaValidationError extends Error {
  public readonly errors: ValidationIssue[];

  constructor(message: string, errors: ValidationIssue[]) {
    super(message);
    this.name = "SchemaValidationError";
    this.errors = errors;
  }
}

/**
 * Returns true when the issue represents a missing required field.
 * Used by the retry loop to distinguish "missing field" retries from hard type errors.
 */
export const isRequiredError = (issue: ValidationIssue): boolean =>
  issue.keyword === "required";

// ---------------------------------------------------------------------------
// Schema-type predicates
// ---------------------------------------------------------------------------

/** Returns true for any Standard Schema V1 implementation (Zod, Valibot, ArkType, …). */
export const isStandardSchema = (schema: unknown): schema is StandardSchema => {
  if (typeof schema !== "object" || schema === null) return false;
  const std = (schema as Record<string, unknown>)["~standard"];
  return (
    typeof std === "object" &&
    std !== null &&
    typeof (std as Record<string, unknown>)["validate"] === "function"
  );
};

const isZodSchema = (schema: unknown): schema is z.ZodType =>
  isStandardSchema(schema) &&
  (schema as { "~standard": { vendor?: string } })["~standard"].vendor === "zod";

// ---------------------------------------------------------------------------
// JSON Schema extraction
// ---------------------------------------------------------------------------

const ARTIFACT_ID_PATTERN = /^artifact:[^/]+\/images\/image\d+\.\w+$/;

/**
 * Recursively pre-process a plain JSON Schema to handle custom formats that
 * `z.fromJSONSchema` doesn't know about.  Currently:
 *   `format: "artifact-id"` → `pattern: ARTIFACT_ID_PATTERN`
 */
const normalizeJsonSchema = (schema: unknown): unknown => {
  if (typeof schema !== "object" || schema === null) return schema;
  if (Array.isArray(schema)) return schema.map(normalizeJsonSchema);

  const obj = schema as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key === "format" && val === "artifact-id") {
      out["pattern"] = ARTIFACT_ID_PATTERN.source;
    } else {
      out[key] = typeof val === "object" && val !== null ? normalizeJsonSchema(val) : val;
    }
  }
  return out;
};

/**
 * Extracts a plain JSON Schema `Record<string, unknown>` from any schema type:
 * - Zod v4 schema       → `z.toJSONSchema(schema)`
 * - Standard JSON Schema → `~standard.jsonSchema.output({ target: "draft-07" })`
 * - Plain object         → returned as-is
 */
export const toJsonSchema = (schema: unknown): Record<string, unknown> => {
  if (isZodSchema(schema)) {
    return z.toJSONSchema(schema, { unrepresentable: "any" }) as Record<string, unknown>;
  }
  if (isStandardSchema(schema)) {
    const std = (schema as Record<string, unknown>)["~standard"] as Record<string, unknown>;
    const jsonSchemaConverter = std["jsonSchema"] as
      | { output: (opts: { target: string }) => Record<string, unknown> }
      | undefined;
    if (typeof jsonSchemaConverter?.output === "function") {
      return jsonSchemaConverter.output({ target: "draft-07" });
    }
  }
  return schema as Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Issue converters
// ---------------------------------------------------------------------------

const fromZodIssues = (issues: z.ZodIssue[]): ValidationIssue[] =>
  issues.map((issue) => {
    let keyword: string | undefined;

    if (issue.code === "invalid_type") {
      // Zod v4 does not populate `input` on issues; the only signal for a
      // missing-vs-wrong-type distinction is the message text.
      // "received undefined" means the field was absent (required but missing).
      // Any other "received X" means the field was present with the wrong type.
      keyword = issue.message.includes("received undefined") ? "required" : "type";
    } else if (issue.code === "invalid_format") {
      keyword = "format";
    } else if (issue.code === "unrecognized_keys") {
      keyword = "additionalProperties";
    } else {
      keyword = issue.code;
    }

    return {
      message: issue.message,
      path: issue.path as (string | number | symbol)[],
      keyword,
    };
  });

const fromStandardIssues = (
  issues: ReadonlyArray<StandardSchemaIssue>,
): ValidationIssue[] =>
  issues.map((issue) => {
    const path = issue.path?.map((p) =>
      typeof p === "object" && "key" in p ? p.key : p,
    ) as (string | number | symbol)[] | undefined;

    // Heuristic keyword detection from issue message.
    // Order matters: check "received undefined" (missing required field) before other
    // "received X" patterns (which indicate a type mismatch on a present field).
    const msg = issue.message.toLowerCase();
    const keyword = msg.includes("received undefined") || msg.includes("required")
      ? "required"
      : msg.includes("invalid type") || msg.includes("expected") || msg.includes("received")
        ? "type"
        : undefined;

    return { message: issue.message, path, keyword };
  });

// ---------------------------------------------------------------------------
// Validator object
// ---------------------------------------------------------------------------

export type Validator = {
  validateOrThrow: <T>(data: unknown) => T;
  validateAllowingMissingRequired: <T>(data: unknown, isFinalAttempt?: boolean) => ValidationResult<T>;
};

// --- Standard Schema validator ---

const standardSchemaValidator = (schema: StandardSchema): Validator => {
  const runValidate = <T>(data: unknown): StandardSchemaResult<T> => {
    const result = schema["~standard"].validate(data);
    if (result instanceof Promise) {
      throw new Error(
        "Async Standard Schema validation is not supported in the synchronous extraction pipeline",
      );
    }
    return result as StandardSchemaResult<T>;
  };

  return {
    validateOrThrow<T>(data: unknown): T {
      const result = runValidate<T>(data);
      if (result.issues) {
        throw new SchemaValidationError(
          "Schema validation failed",
          fromStandardIssues(result.issues),
        );
      }
      return result.value;
    },

    validateAllowingMissingRequired<T>(data: unknown, isFinalAttempt = true): ValidationResult<T> {
      const result = runValidate<T>(data);
      if (!result.issues) {
        return { valid: true, data: result.value };
      }

      const issues = fromStandardIssues(result.issues);
      const nonRequired = issues.filter((i) => !isRequiredError(i));

      if (nonRequired.length === 0) {
        // Only required-field failures — accept on the final attempt
        return isFinalAttempt
          ? { valid: true, data: data as T }
          : { valid: false, errors: issues };
      }
      return { valid: false, errors: nonRequired };
    },
  };
};

// --- JSON Schema validator (backed by z.fromJSONSchema) ---

const jsonSchemaValidator = (jsonSchema: Record<string, unknown>): Validator => {
  // Compile once; store error so repeated calls don't retry compilation
  let compiled: z.ZodType | null = null;
  let compileError: Error | null = null;

  const getSchema = (): z.ZodType => {
    if (compiled) return compiled;
    if (compileError) throw compileError;
    try {
      const normalized = normalizeJsonSchema(jsonSchema) as Record<string, unknown>;
      compiled = z.fromJSONSchema(normalized) as z.ZodType;
      return compiled;
    } catch (err) {
      compileError = err as Error;
      throw err;
    }
  };

  return {
    validateOrThrow<T>(data: unknown): T {
      const result = getSchema().safeParse(data);
      if (!result.success) {
        throw new SchemaValidationError(
          "Schema validation failed",
          fromZodIssues(result.error.issues),
        );
      }
      return result.data as T;
    },

    validateAllowingMissingRequired<T>(data: unknown, isFinalAttempt = true): ValidationResult<T> {
      const result = getSchema().safeParse(data);
      if (result.success) {
        return { valid: true, data: result.data as T };
      }

      const issues = fromZodIssues(result.error.issues);
      const nonRequired = issues.filter((i) => !isRequiredError(i));

      if (nonRequired.length === 0) {
        // Only required-field failures — accept on the final attempt
        return isFinalAttempt
          ? { valid: true, data: data as T }
          : { valid: false, errors: issues };
      }
      return { valid: false, errors: nonRequired };
    },
  };
};

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

/**
 * Creates a `Validator` for any schema type:
 * - Standard Schema V1 (Zod, Valibot, ArkType, …) → uses `~standard.validate()`
 * - Plain JSON Schema object                        → compiled via `z.fromJSONSchema()`
 */
export const createValidator = (schema: unknown): Validator => {
  if (isStandardSchema(schema)) {
    return standardSchemaValidator(schema as StandardSchema);
  }
  return jsonSchemaValidator(schema as Record<string, unknown>);
};
