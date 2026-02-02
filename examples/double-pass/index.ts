import { extract, doublePass, type Artifact } from "../../src/index";
import type { JSONSchemaType } from "ajv";

type Output = {
  title: string;
  details: string;
};

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    title: { type: "string" },
    details: { type: "string" },
  },
  required: ["title", "details"],
  additionalProperties: false,
};

const artifacts: Artifact[] = [
  {
    id: "example-1",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 1, text: "Title: Sample\nDetails: More text" }],
  },
];

const result = await extract({
  artifacts,
  schema,
  strategy: doublePass({
    model: {},
    mergeModel: {},
    chunkSize: 10_000,
  }),
});

console.log(result.data);
