import { extract, parallel, type Artifact } from "../../src/index";
import type { JSONSchemaType } from "ajv";

type Output = {
  items: Array<{ name: string }>;
};

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const artifacts: Artifact[] = [
  {
    id: "example-1",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 1, text: "Item: Alpha" }],
  },
  {
    id: "example-2",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 2, text: "Item: Beta" }],
  },
];

const result = await extract({
  artifacts,
  schema,
  strategy: parallel({
    model: {},
    mergeModel: {},
    chunkSize: 10_000,
    concurrency: 2,
  }),
});

console.log(result.data);
