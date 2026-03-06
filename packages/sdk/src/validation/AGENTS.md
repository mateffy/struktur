Validation module

- Purpose: Schema validation and error shaping.
- Key files: `validator.ts`.
- Design: `validateOrThrow` compiles schemas and throws `SchemaValidationError` on failure; `createAjv` registers `ajv-formats` for common schema formats and adds custom `artifact-id` format for referencing images in artifacts.
- Custom formats: `artifact-id` validates strings matching pattern `artifact:ID/images/imageNUM.EXT` (e.g., `artifact:123456/images/image1.jpg`).
- Tests: `validator.test.ts`.
