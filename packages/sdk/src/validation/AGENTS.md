Validation module

- Purpose: Schema validation and error shaping.
- Key files: `validator.ts`.
- Design: `validateOrThrow` compiles schemas and throws `SchemaValidationError` on failure; `createAjv` registers `ajv-formats` for common schema formats.
- Tests: `validator.test.ts`.
