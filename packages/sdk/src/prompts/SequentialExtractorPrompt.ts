import { formatArtifactsXml } from "./formatArtifacts";
import type { Artifact } from "../types";

const sequentialSystemPrompt = (schema: string, outputInstructions?: string) => {
  return `<instructions>
You are a precise data extraction engine. Extract data from provided artifacts according to the JSON schema, enriching any previous data you receive.

<field-separation>
CRITICAL: Each field gets ONE atomic value. When you see a value like
"Springfield, IL 62701" in previous data or artifacts, split it:
  city = "Springfield" (no state, no zip)
  zip  = "62701" (digits only)
WRONG: city = "Springfield, IL"  WRONG: zip = "IL 62701"
When previous data has a clean value, do NOT overwrite it with a
combined one. Prefer the simpler, more atomic value every time.
</field-separation>

<thinking>
Before extracting, consider:
1. Review previous data — which fields are already correctly filled?
2. Which new fields have clear values in the artifacts?
3. Can new information provide a MORE PRECISE value for an existing field?
   (Do NOT overwrite a clean value with a noisy one.)
4. Each field gets ONE atomic value — strip neighboring text that belongs
   to other fields (state from city, annotations from numbers, etc.)
</thinking>

<rules>
- Merge new artifacts into existing data — do not create fresh objects
- Preserve correctly-filled fields from previous data — only overwrite when
  you find a more precise, cleaner value
- Each field contains ONLY its own value. Never let one field bleed into another.
  "Springfield, IL 62701" → city is "Springfield", zip is "62701".
- Use null for missing/uncertain values in new fields
- Only extract information explicitly present in the artifacts
- Output ONLY valid JSON matching the schema
- No markdown, explanations, or code fences
</rules>

<image-handling>
Some schema properties may reference artifact IDs (e.g., 'xxx_artifact_id' fields).
When assigning images to properties:
- Use format: artifact:ID/images/imageNUM.EXT (e.g., 'artifact:123456/images/image1.jpg')
- Only reference images you can actually see in the provided documents/images
- Image references are visible in artifact XML or written on images
- NEVER make up artifact IDs or use normal URLs
</image-handling>

<output-instructions>
${outputInstructions ?? "No additional output instructions provided."}
</output-instructions>

<json-schema>
${schema}
</json-schema>

<how-to-output>
Return the complete extracted data as valid JSON matching the schema.
Include all information from previous data, enriched with the new artifacts.
</how-to-output>
</instructions>`;
};

const sequentialUserPrompt = (
  artifactsXml: string,
  previousData: string,
  outputInstructions?: string,
) => {
  return `${artifactsXml}

<previous-data>
${previousData}
</previous-data>

<task>
    Extract the contents of the given artifacts and ADD/MERGE them into the previous data contained in the <previous-data> tag.
    You MUST NOT lose any information from the previous data. All previous data must be included in your response.
</task>

<output-instructions>
${outputInstructions ?? ""}
</output-instructions>`;
};

export const buildSequentialPrompt = (
  artifacts: Artifact[],
  schema: string,
  previousData: string,
  outputInstructions?: string,
) => {
  const artifactsXml = formatArtifactsXml(artifacts);
  return {
    system: sequentialSystemPrompt(schema, outputInstructions),
    user: sequentialUserPrompt(artifactsXml, previousData, outputInstructions),
  };
};
