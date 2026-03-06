/**
 * fields.ts — Shorthand schema builder.
 *
 * Parses a comma-separated fields string into a minimal JSON Schema object.
 * Supported type expressions:
 *
 *   string (default)   title
 *   number / float     price:number  or  price:float
 *   boolean / bool     active:boolean  or  active:bool
 *   integer            count:integer
 *   int                count:int  (integer + multipleOf:1 to disallow fractions)
 *   enum               status:enum{draft|published|archived}
 *   array of scalar    tags:array{string}
 *   array (shorthand)  tags:array  (defaults to array{string})
 *
 * Aliases:
 *   bool  → boolean
 *   float → number
 *   int   → integer (with multipleOf: 1)
 *
 * Examples:
 *   parseFieldsString("title, description")
 *   parseFieldsString("title, price:number")
 *   parseFieldsString("title , price: number , active:boolean")
 *   parseFieldsString("name, status:enum{draft|published}")
 *   parseFieldsString("name, tags:array{string}")
 *   parseFieldsString("name, tags:array")
 *   parseFieldsString("count:int, ratio:float, enabled:bool")
 */

import type { AnyJSONSchema } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScalarFieldType = "string" | "number" | "boolean" | "integer" | "int";

export type ParsedField =
  | { name: string; kind: "scalar"; type: ScalarFieldType }
  | { name: string; kind: "enum"; values: string[] }
  | { name: string; kind: "array"; items: ScalarFieldType };

/** Legacy alias kept for backwards compatibility */
export type FieldType = ScalarFieldType;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCALAR_TYPES: ReadonlySet<string> = new Set([
  "string",
  "number",
  "boolean",
  "integer",
  "int",
]);

/** Maps alias → canonical type accepted by this parser. */
const SCALAR_ALIASES: Readonly<Record<string, ScalarFieldType>> = {
  bool:  "boolean",
  float: "number",
  // Note: "int" stays as "int" (not aliased to "integer") so the schema
  // builder can emit the extra multipleOf:1 constraint.
};

// ---------------------------------------------------------------------------
// Internal parser helpers
// ---------------------------------------------------------------------------

/**
 * Extract the content inside `prefix{...}` from a raw type string.
 * Returns `null` if the pattern doesn't match.
 */
const extractBraces = (
  rawType: string,
  prefix: string,
): string | null => {
  if (!rawType.startsWith(prefix + "{") || !rawType.endsWith("}")) {
    return null;
  }
  return rawType.slice(prefix.length + 1, -1);
};

const parseScalarType = (raw: string, fieldName: string): ScalarFieldType => {
  // Resolve aliases first.
  const resolved: string = SCALAR_ALIASES[raw] ?? raw;
  if (!SCALAR_TYPES.has(resolved)) {
    const allNames = [...Object.keys(SCALAR_ALIASES), ...SCALAR_TYPES].sort();
    throw new Error(
      `Unknown type "${raw}" for field "${fieldName}". ` +
        `Scalar types: ${allNames.join(", ")}. ` +
        `Complex types: enum{a|b|c}, array{string}, or array (shorthand for array{string}).`,
    );
  }
  return resolved as ScalarFieldType;
};

/**
 * Parse a single `name` or `name:type` token into a ParsedField.
 * Trims whitespace from name and type expression.
 */
const parseField = (token: string): ParsedField => {
  const colonIndex = token.indexOf(":");

  if (colonIndex === -1) {
    const name = token.trim();
    if (!name) throw new Error("Empty field name in fields string.");
    return { name, kind: "scalar", type: "string" };
  }

  const name = token.slice(0, colonIndex).trim();
  const rawType = token.slice(colonIndex + 1).trim();

  if (!name) {
    throw new Error(`Empty field name before colon in token: "${token}".`);
  }
  if (!rawType) {
    throw new Error(
      `Empty type after colon for field "${name}". ` +
        `Omit the colon or specify a type.`,
    );
  }

  // enum{a|b|c}
  const enumContent = extractBraces(rawType, "enum");
  if (enumContent !== null) {
    const values = enumContent.split("|").map((v) => v.trim()).filter(Boolean);
    if (values.length < 2) {
      throw new Error(
        `enum for field "${name}" must have at least two values separated by "|", got: "${enumContent}".`,
      );
    }
    return { name, kind: "enum", values };
  }

  // array{itemType}
  const arrayContent = extractBraces(rawType, "array");
  if (arrayContent !== null) {
    const itemType = arrayContent.trim();
    if (!itemType) {
      throw new Error(
        `array for field "${name}" requires an item type, e.g. array{string}.`,
      );
    }
    return { name, kind: "array", items: parseScalarType(itemType, name) };
  }

  // array (shorthand for array{string})
  if (rawType === "array") {
    return { name, kind: "array", items: "string" };
  }

  // plain scalar
  return { name, kind: "scalar", type: parseScalarType(rawType, name) };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a comma-separated fields string into an array of ParsedField entries.
 *
 * @example
 * parseFieldsString("title, price:number")
 * // => [{ name: "title", kind: "scalar", type: "string" }, { name: "price", kind: "scalar", type: "number" }]
 *
 * parseFieldsString("status:enum{draft|published}")
 * // => [{ name: "status", kind: "enum", values: ["draft", "published"] }]
 *
 * parseFieldsString("tags:array{string}")
 * // => [{ name: "tags", kind: "array", items: "string" }]
 */
export const parseFieldsString = (fields: string): ParsedField[] => {
  if (!fields.trim()) {
    throw new Error("Fields string must not be empty.");
  }

  // Split on commas that are NOT inside braces so enum{a|b,c} would still
  // work if someone added commas — but per spec values use |, so a simple
  // brace-depth split is sufficient and keeps things robust.
  const tokens: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of fields) {
    if (ch === "{") { depth++; current += ch; }
    else if (ch === "}") { depth--; current += ch; }
    else if (ch === "," && depth === 0) { tokens.push(current); current = ""; }
    else { current += ch; }
  }
  if (current) tokens.push(current);

  if (depth !== 0) {
    throw new Error("Unmatched braces in fields string.");
  }

  return tokens.map((token) => parseField(token));
};

/**
 * Build a minimal JSON Schema `object` from a parsed fields array.
 * All fields are required; additionalProperties is false.
 */
export const buildSchemaFromParsedFields = (
  fields: ParsedField[],
): AnyJSONSchema => {
  if (fields.length === 0) {
    throw new Error("Cannot build a schema from an empty fields list.");
  }

  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const field of fields) {
    if (field.kind === "scalar") {
      properties[field.name] = field.type === "int"
        ? { type: "integer", multipleOf: 1 }
        : { type: field.type };
    } else if (field.kind === "enum") {
      properties[field.name] = { type: "string", enum: field.values };
    } else {
      // array
      properties[field.name] = { type: "array", items: field.items === "int" ? { type: "integer", multipleOf: 1 } : { type: field.items } };
    }
    required.push(field.name);
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
};

/**
 * Convenience: parse a fields string and immediately build a JSON Schema.
 *
 * @example
 * buildSchemaFromFields("title, price:number")
 * buildSchemaFromFields("status:enum{draft|published|archived}")
 * buildSchemaFromFields("tags:array{string}")
 */
export const buildSchemaFromFields = (fields: string): AnyJSONSchema =>
  buildSchemaFromParsedFields(parseFieldsString(fields));
