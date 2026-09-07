import { formatArtifactsXml } from "./formatArtifacts";
import type { Artifact } from "../types";

const extractorSystemPrompt = (schema: string, outputInstructions?: string) => {
  return `<instructions>
You are a precise data extraction engine. Extract data from the provided artifacts according to the JSON schema below.

<field-separation>
CRITICAL: Each field gets ONE atomic value. When the source packs multiple
pieces of information into one phrase, you MUST split them into the correct fields.

  Source: "123 Main St, Springfield, IL 62701"
  → street = "123 Main St"
  → city   = "Springfield"
  → zip    = "62701"

WRONG: city = "Springfield, IL"        — state bled into city
WRONG: city = "Springfield IL 62701"   — state+zip bled into city
WRONG: zip  = "IL 62701"               — state prefix in zip

Zip codes are exactly 5 digits. City names contain no commas, no state
abbreviations, no zip codes. Street addresses are everything before the
city boundary — do NOT include the city, state, or zip in the street.
</field-separation>

<thinking>
Before extracting, consider:
1. Which schema fields have clear values in the artifacts?
2. Which fields are missing or unclear (set these to null)?
3. For each field: what is the EXACT atomic value? Strip all neighboring text.
</thinking>

<rules>
- Apply <field-separation> rules to EVERY address-like field you extract
- Each field contains ONLY its own atomic value. Never include text that
  belongs to a different field (state abbreviations, postal codes, etc.)
- Strictly follow the schema — no extra fields, no missing required fields
- Use null for missing or uncertain values — never guess or assume
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

<field-separation-rule>
Before outputting, check EVERY field:
- city fields: strip state abbreviations (IL, NY, CA, etc.) and zip codes
- zip fields: digits only, exactly 5 digits, no letters or spaces
- street fields: end before the city name, no city/state/zip included
- If a value contains a comma, you probably have two fields merged — split them
</field-separation-rule>

<task>Extract the contents of the given artifacts.</task>`;
};

export const buildExtractorPrompt = (
  artifacts: Artifact[],
  schema: string,
  outputInstructions?: string,
) => {
  const artifactsXml = formatArtifactsXml(artifacts);
  return {
    system: extractorSystemPrompt(schema, outputInstructions),
    user: extractorUserPrompt(artifactsXml),
  };
};