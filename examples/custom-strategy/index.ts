import {
  extract,
  type Artifact,
  type ExtractionOptions,
  type ExtractionResult,
  type ExtractionStrategy,
} from "../../src/index";
import type { JSONSchemaType } from "ajv";

type Output = { ok: boolean };

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: { ok: { type: "boolean" } },
  required: ["ok"],
  additionalProperties: false,
};

const artifacts: Artifact[] = [
  {
    id: "example-1",
    type: "text",
    raw: async () => Buffer.from(""),
    contents: [{ text: "Custom strategy" }],
  },
];

const customStrategy: ExtractionStrategy<Output> = {
  name: "custom",
  async run(options: ExtractionOptions<Output>): Promise<ExtractionResult<Output>> {
    return {
      data: { ok: options.artifacts.length > 0 },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  },
};

const result = await extract({
  artifacts,
  schema,
  strategy: customStrategy,
});

console.log(result.data);
