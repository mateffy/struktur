import { z } from "zod";
import { defineCase, type SchemaOutput } from "./types";
import type { Artifact } from "@struktur/sdk";

const noArtifacts: Artifact[] = [];

// --- SchemaOutput inference ------------------------------------------------

{
  const schema = z.object({ name: z.string(), total: z.number() });
  type Out = SchemaOutput<typeof schema>;
  // correct shape
  defineCase({ id: "ok", schema, gold: { name: "a", total: 1 }, artifacts: noArtifacts });
  // @ts-expect-error gold is missing `total`
  defineCase({ id: "bad1", schema, gold: { name: "a" }, artifacts: noArtifacts });
  // @ts-expect-error `total` must be a number
  defineCase({ id: "bad2", schema, gold: { name: "a", total: "x" }, artifacts: noArtifacts });
  // @ts-expect-error unknown field
  defineCase({ id: "bad3", schema, gold: { name: "a", total: 1, extra: true }, artifacts: noArtifacts });
  const _out: Out = { name: "x", total: 2 };
  void _out;
}

// --- Untagged JSON Schema falls back to unknown -----------------------------

{
  const plain = { type: "object", properties: { a: { type: "string" } } };
  type Out = SchemaOutput<typeof plain>;
  const check: Out = undefined as unknown;
  // gold is unknown — any value is allowed (no type error)
  defineCase({ id: "plain", schema: plain, gold: { anything: "goes" }, artifacts: noArtifacts });
  void check;
}
