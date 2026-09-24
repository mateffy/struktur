import * as ai from "ai";

/**
 * The AI SDK surface used by `LLMClient`, re-exported through a module of our
 * own.
 *
 * `LLMClient.test.ts` needs to stub the `generateText` call. Mocking `"ai"`
 * directly is not an option: Bun's `mock.module` applies process-wide, is not
 * undone by `mock.restore()`, and leaks into every later test file that imports
 * the AI SDK (the agent-strategy loop tests need the real `generateText`/`tool`).
 *
 * The exports are copied bindings, not `export … from "ai"` re-exports: with a
 * re-export Bun still treats the two modules as sharing the mocked binding, so
 * stubbing this module would stub `ai` for everyone again.
 */
export const generateText = ai.generateText;
export const Output = ai.Output;
export const jsonSchema = ai.jsonSchema;
export type ModelMessage = import("ai").ModelMessage;
