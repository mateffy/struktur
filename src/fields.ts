/**
 * fields.ts — Shorthand schema builder.
 *
 * Parses a comma-separated fields string like `"title, price:number"` into a
 * minimal JSON Schema object.  Supported types: string (default), number,
 * boolean, integer.  No further validation — this is a quick-entry helper.
 *
 * Examples:
 *   parseFieldsString("title, description")
 *   parseFieldsString("title, price:number")
 *   parseFieldsString("title , price: number , active:boolean")
 */

import type { AnyJSONSchema } from "./types";

export type FieldType = "string" | "number" | "boolean" | "integer";

export type ParsedField = {
  name: string;
  type: FieldType;
};

const ALLOWED_TYPES: ReadonlySet<string> = new Set([
  "string",
  "number",
  "boolean",
  "integer",
]);

/**
 * Parse a single `name` or `name:type` token into a ParsedField.
 * Trims whitespace from both name and type.
 */
const parseField = (token: string): ParsedField => {
  const colonIndex = token.indexOf(":");
  if (colonIndex === -1) {
    const name = token.trim();
    if (!name) {
      throw new Error(`Empty field name in fields string.`);
    }
    return { name, type: "string" };
  }

  const name = token.slice(0, colonIndex).trim();
  const rawType = token.slice(colonIndex + 1).trim();

  if (!name) {
    throw new Error(`Empty field name before colon in token: "${token}".`);
  }
  if (!rawType) {
    throw new Error(
      `Empty type after colon for field "${name}". Omit the colon or specify a type (string, number, boolean, integer).`,
    );
  }
  if (!ALLOWED_TYPES.has(rawType)) {
    throw new Error(
      `Unknown type "${rawType}" for field "${name}". Allowed types: ${[...ALLOWED_TYPES].join(", ")}.`,
    );
  }

  return { name, type: rawType as FieldType };
};

/**
 * Parse a comma-separated fields string into an array of ParsedField entries.
 *
 * @example
 * parseFieldsString("title, price:number")
 * // => [{ name: "title", type: "string" }, { name: "price", type: "number" }]
 */
export const parseFieldsString = (fields: string): ParsedField[] => {
  if (!fields.trim()) {
    throw new Error("Fields string must not be empty.");
  }

  return fields.split(",").map((token) => parseField(token));
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

  const properties: Record<string, { type: string }> = {};
  const required: string[] = [];

  for (const field of fields) {
    properties[field.name] = { type: field.type };
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
 * // => { type: "object", properties: { title: { type: "string" }, price: { type: "number" } }, required: [...], additionalProperties: false }
 */
export const buildSchemaFromFields = (fields: string): AnyJSONSchema =>
  buildSchemaFromParsedFields(parseFieldsString(fields));
