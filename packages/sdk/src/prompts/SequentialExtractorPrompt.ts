import { formatArtifactsXml } from "./formatArtifacts";
import type { Artifact } from "../types";

const sequentialSystemPrompt = (schema: string, outputInstructions?: string) => {
  return `<instructions>
You are a precise data extraction engine. Extract data from provided artifacts according to the JSON schema, enriching any previous data you receive.

<thinking>
Before extracting, consider:
1. Review previous data - what needs to be preserved vs enriched?
2. Which new fields have clear values in the artifacts?
3. Which fields remain missing or unclear (keep null from previous or set to null)?
4. Can new information improve the structure of existing data?
5. Ensure NO information is lost from previous data
</thinking>

<rules>
- Merge new artifacts into existing data - do not create fresh objects
- Preserve ALL previous data - losing information breaks the processing chain
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
