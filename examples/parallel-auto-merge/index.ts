import { extract, parallelAutoMerge, type Artifact } from "../../src/index";
import type { JSONSchemaType } from "ajv";

type Output = {
  items: Array<{ id: number; name: string }>;
};

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" },
        },
        required: ["id", "name"],
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
    contents: [{ page: 1, text: "Item 1: Alpha" }],
  },
  {
    id: "example-2",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 2, text: "Item 1: Alpha" }],
  },
];

const result = await extract({
  artifacts,
  schema,
  strategy: parallelAutoMerge({
    model: {},
    chunkSize: 10_000,
  }),
});

console.log(result.data);
