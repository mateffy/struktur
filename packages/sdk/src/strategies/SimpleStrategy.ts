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
    const debug = options.debug;
    const telemetry = options.telemetry ?? undefined;
    
    // Create strategy-level span
    const strategySpan = telemetry?.startSpan({
      name: "strategy.simple",
      kind: "CHAIN",
      attributes: {
        "strategy.name": this.name,
        "strategy.artifacts.count": options.artifacts.length,
      },
    });
    
    const schema = serializeSchema(options.schema);
    const { system, user } = buildExtractorPrompt(
      options.artifacts,
      schema,
      this.config.outputInstructions,
    );

    // Emit start event before extraction begins
    await options.events?.onStep?.({
      step: 1,
      total: this.getEstimatedSteps(),
      label: "extract",
    });
    debug?.step({
      step: 1,
      total: this.getEstimatedSteps(),
      label: "extract",
      strategy: this.name,
    });

    const result = await extractWithPrompt<T>({
      model: this.config.model,
      schema: options.schema,
      system,
      user,
      artifacts: options.artifacts,
      events: options.events,
      execute: this.config.execute as never,
      strict: options.strict ?? this.config.strict,
      debug,
      callId: "simple_extract",
      telemetry,
      parentSpan: strategySpan,
    });

    debug?.step({
      step: 2,
      total: this.getEstimatedSteps(),
      label: "complete",
      strategy: this.name,
    });

    // End strategy span
    telemetry?.endSpan(strategySpan!, {
      status: "ok",
      output: result.data,
    });

    return { data: result.data, usage: result.usage };
  }
}

export const simple = <T>(config: SimpleStrategyConfig) => {
  return new SimpleStrategy<T>(config);
};
