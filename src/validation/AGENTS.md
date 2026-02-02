Validation module

- Purpose: Ajv schema validation and error shaping.
- Key files: `validator.ts`.
- Design: `validateOrThrow` compiles schemas and throws `SchemaValidationError` on failure.
- Tests: `validator.test.ts`.
