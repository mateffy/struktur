import { createAjv, validateOrThrow, SchemaValidationError, validateAllowingMissingRequired } from "../validation/validator";
import type { ModelMessage } from "ai";
import type { ExtractionEvents, Usage } from "../types";
import { generateStructured } from "./LLMClient";
import type { UserContent } from "./message";

export type RetryOptions<T> = {
  model: unknown;
  schema: unknown;
  system: string;
  user: UserContent;
  events?: ExtractionEvents;
  maxAttempts?: number;
  schemaName?: string;
  execute?: typeof generateStructured<T>;
  strict?: boolean;
};

export const runWithRetries = async <T>(options: RetryOptions<T>) => {
  const ajv = createAjv();
  const maxAttempts = options.maxAttempts ?? 3;
  const messages: ModelMessage[] = [
    { role: "user", content: options.user },
  ];

  let usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const executor = options.execute ?? generateStructured;
    const result = await executor({
      model: options.model,
      schema: options.schema,
      schemaName: options.schemaName,
      system: options.system,
      user: options.user,
      messages,
    });

    usage = {
      inputTokens: usage.inputTokens + result.usage.inputTokens,
      outputTokens: usage.outputTokens + result.usage.outputTokens,
      totalTokens: usage.totalTokens + result.usage.totalTokens,
    };

    try {
      const isFinalAttempt = attempt === maxAttempts;
      const useStrictValidation = options.strict === true || isFinalAttempt;

      if (useStrictValidation) {
        const validated = validateOrThrow<T>(ajv, options.schema as never, result.data);
        return { data: validated, usage };
      } else {
        const validationResult = validateAllowingMissingRequired<T>(
          ajv,
          options.schema as never,
          result.data
        );
        
        if (validationResult.valid) {
          return { data: validationResult.data, usage };
        }
        
        throw new SchemaValidationError(
          "Schema validation failed",
          validationResult.errors
        );
      }
    } catch (error) {
      lastError = error as Error;

      if (error instanceof SchemaValidationError) {
        const errorPayload = JSON.stringify(error.errors, null, 2);
        const errorMessage = `<validation-errors>\n${errorPayload}\n</validation-errors>`;
        messages.push({ role: "user", content: errorMessage });
        await options.events?.onMessage?.({ role: "user", content: errorMessage });
        continue;
      }

      break;
    }
  }

  throw lastError ?? new Error("Unknown extraction error");
};
