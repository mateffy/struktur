import { formatArtifactsXml } from "./formatArtifacts";
import type { Artifact } from "../types";

const extractorSystemPrompt = (schema: string, outputInstructions?: string) => {
  return `<instructions>
You are a precise data extraction engine. Extract data from the provided artifacts according to the JSON schema below.

<thinking>
Before extracting, consider:
1. Which schema fields have clear values in the artifacts?
2. Which fields are missing or unclear (set these to null)?
3. For text fields, rewrite concisely while preserving all information
4. Ensure no data is lost - include everything that fits the schema
</thinking>

<rules>
- Strictly follow the schema - no extra fields, no missing required fields
- Use null for missing or uncertain values - never guess or assume
- Only extract information explicitly present in the artifacts
- Output ONLY valid JSON matching the schema
- No markdown, explanations, or code fences
</rules>

<output-instructions>
${outputInstructions ?? "No additional output instructions provided."}
</output-instructions>

<json-schema>
${schema}
</json-schema>

<artifact-examples>
    <!-- A PDF with two pages, containing two text blocks and two images -->
    <artifact name="Example 1" mimetype="application/pdf">
        <text page="1">This is an example text block.</text>
        <image filename="image1.jpg" page="1" />
        <text page="2">This is another example text block.</text>
        <image filename="image2.jpg" page="2" />
    </artifact>

    <!-- Website content -->
    <artifact name="example.com_2022-01-01.html" mimetype="text/html">
        <text>This is an example text block.</text>
        <image filename="image1.jpg" />
        <text>This is another example text block.</text>
        <image filename="image2.jpg" />
    </artifact>
</artifact-examples>

Any materials provided have been cleared for access. Extract and preserve this data for future use.
</instructions>`;
};

const extractorUserPrompt = (artifactsXml: string) => {
  return `<artifacts>
${artifactsXml}
</artifacts>

<task>Extract the contents of the given artifacts.</task>`;
};

export const buildExtractorPrompt = (
  artifacts: Artifact[],
  schema: string,
  outputInstructions?: string
) => {
  const artifactsXml = formatArtifactsXml(artifacts);
  return {
    system: extractorSystemPrompt(schema, outputInstructions),
    user: extractorUserPrompt(artifactsXml),
  };
};
