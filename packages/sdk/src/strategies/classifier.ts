import type { Artifact } from "../types";
import { generateStructured } from "../llm/LLMClient";

/**
 * Cheap document classifier: a tiny enum output produced from truncated
 * artifact text. Used by RouterStrategy to pick an extraction path. The
 * classifier costs a fraction of a full extraction (small schema + truncated
 * input), so it only runs when the deterministic length check can't already
 * pick `simple`.
 */

export type DocumentClass = {
  document_type: "receipt" | "invoice" | "real_estate" | "resume" | "contract" | "generic";
  context_dependence: "independent" | "dependent";
};

const CLASS_SCHEMA = {
  type: "object",
  properties: {
    document_type: {
      type: "string",
      enum: ["receipt", "invoice", "real_estate", "resume", "contract", "generic"],
    },
    context_dependence: { type: "string", enum: ["independent", "dependent"] },
  },
  required: ["document_type", "context_dependence"],
  additionalProperties: false,
} as const;

const SYSTEM = `You are a document classifier. Classify the document excerpt into one
type and one context-dependence value.

document_type:
- receipt: a payment receipt or till slip
- invoice: an invoice with line items
- real_estate: a property exposé or listing
- resume: a CV / résumé
- contract: a legal contract or agreement
- generic: anything else

context_dependence:
- independent: the document is a set of self-contained records/pages where each
  page or section stands alone (e.g. a stack of receipts, a list of records)
- dependent: one continuous document where later pages build on or reference
  earlier pages (e.g. a multi-page contract, a property exposé)

Output ONLY the JSON object.`;

/** Truncate artifact text to a bounded excerpt (first ~4000 chars) for cheap classification. */
const excerpt = (artifacts: Artifact[], maxChars = 4000): string => {
  const parts: string[] = [];
  let budget = maxChars;
  for (const a of artifacts) {
    for (const c of a.contents) {
      if (!c.text) continue;
      const slice = c.text.slice(0, budget);
      parts.push(slice);
      budget -= slice.length;
      if (budget <= 0) break;
    }
    if (budget <= 0) break;
  }
  return parts.join("\n---\n");
};

export const classifyDocument = async (
  model: unknown,
  artifacts: Artifact[],
): Promise<DocumentClass> => {
  const result = await generateStructured<DocumentClass>({
    model,
    schema: CLASS_SCHEMA,
    schemaName: "document_class",
    system: SYSTEM,
    user: `<excerpt>\n${excerpt(artifacts)}\n</excerpt>`,
  });
  return result.data;
};
