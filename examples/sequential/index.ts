import { extract, sequential, type Artifact } from "../../src/index";
import type { JSONSchemaType } from "ajv";

type Output = {
  summary: string;
};

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    summary: { type: "string" },
  },
  required: ["summary"],
  additionalProperties: false,
};

const artifacts: Artifact[] = [
  {
    id: "example-1",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 1, text: "First section" }],
  },
  {
    id: "example-2",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 2, text: "Second section" }],
  },
];

const result = await extract({
  artifacts,
  schema,
  strategy: sequential({
    model: {},
    chunkSize: 10_000,
  }),
});

console.log(result.data);
