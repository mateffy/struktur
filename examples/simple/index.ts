import { extract, simple, type Artifact } from "../../src/index";
import type { JSONSchemaType } from "ajv";

type Output = {
  title: string;
};

const schema: JSONSchemaType<Output> = {
  type: "object",
  properties: {
    title: { type: "string" },
  },
  required: ["title"],
  additionalProperties: false,
};

const artifacts: Artifact[] = [
  {
    id: "example-1",
    type: "pdf",
    raw: async () => Buffer.from(""),
    contents: [{ page: 1, text: "Title: Example Document" }],
  },
];

const result = await extract({
  artifacts,
  schema,
  strategy: simple({
    model: {},
  }),
});

console.log(result.data);
