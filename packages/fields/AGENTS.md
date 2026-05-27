# @struktur/fields

## Overview

Standalone shorthand JSON Schema builder. Parses a comma-separated fields string like `title, price:number, tags:array{string}` into a minimal JSON Schema object.

Zero dependencies, zero coupling to Struktur SDK. Can be used by any system that needs a quick way to generate JSON Schema objects from a concise DSL.

## Public API

- `parseFieldsString(fields: string): ParsedField[]` — parses a fields string into structured tokens
- `buildSchemaFromParsedFields(fields: ParsedField[]): Record<string, unknown>` — builds a JSON Schema object from parsed tokens
- `buildSchemaFromFields(fields: string): Record<string, unknown>` — convenience wrapper that parses and builds in one step

## Types

- `ScalarFieldType` — `"string" | "number" | "boolean" | "integer" | "int"`
- `ParsedField` — discriminated union of scalar, enum, and array field descriptors
- `FieldType` — legacy alias for `ScalarFieldType`

## Supported Type Expressions

- `string` (default when no type is specified)
- `number` / `float`
- `boolean` / `bool`
- `integer` / `int` (int adds `multipleOf: 1`)
- `enum{a|b|c}`
- `array{string}` — array of scalar type
- `array` — shorthand for `array{string}`

## File Structure

- `src/index.ts` — main entrypoint with parser, builder, and all public exports
- `src/fields.test.ts` — test suite
