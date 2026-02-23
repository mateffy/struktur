import type { ExtractionResult, ExtractionStrategy } from "../types";
import type { ExtractionOptions } from "../types";
import { buildExtractorPrompt } from "../prompts/ExtractorPrompt";
import { extractWithPrompt, serializeSchema } from "./utils";
import { runWithRetries } from "../llm/RetryingRunner";

export type SimpleStrategyConfig = {
  model: unknown;
  outputInstructions?: string;
  execute?: typeof runWithRetries;
  strict?: boolean;
};

export class SimpleStrategy<T> implements ExtractionStrategy<T> {
  public name = "simple";
  private config: SimpleStrategyConfig;

  constructor(config: SimpleStrategyConfig) {
    this.config = config;
  }

  getEstimatedSteps(): number {
    return 3;
  }

  async run(options: ExtractionOptions<T>): Promise<ExtractionResult<T>> {
    const schema = serializeSchema(options.schema);
    const { system, user } = buildExtractorPrompt(
      options.artifacts,
      schema,
      this.config.outputInstructions
    );

    const result = await extractWithPrompt<T>({
      model: this.config.model,
      schema: options.schema,
      system,
      user,
      artifacts: options.artifacts,
      events: options.events,
      execute: this.config.execute as never,
      strict: this.config.strict,
    });

    await options.events?.onStep?.({
      step: 2,
      total: this.getEstimatedSteps(),
      label: "extract",
    });

    return { data: result.data, usage: result.usage };
  }
}

export const simple = <T>(config: SimpleStrategyConfig) => {
  return new SimpleStrategy<T>(config);
};
