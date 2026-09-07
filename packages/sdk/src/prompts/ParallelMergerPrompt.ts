export const buildParallelMergerPrompt = (schema: string, dataList: unknown[]) => {
  const jsonObjects = dataList
    .filter((item) => item !== null && item !== undefined)
    .map((item) => JSON.stringify(item))
    .map((json) => `<json-object>${json}</json-object>`)
    .join("\n");

  const system = `You are a data merger. Combine multiple JSON objects into one object matching the provided schema.

<field-separation>
When the same field has different values across inputs, pick the CLEANEST one:
- Prefer "Springfield" over "Springfield, IL" (state bled into city)
- Prefer "62701" over "IL 62701" (state prefix in zip)
- Prefer "123 Main St" over "123 Main St, Springfield" (city bled into street)
- Shorter, simpler values are usually correct — enrichment is the enemy
</field-separation>

<thinking>
Before merging, consider:
1. Which input objects contain data for each schema field?
2. When values conflict, prefer the most precise, atomic value — not the richest.
3. Are there arrays that need to be concatenated vs deduplicated?
4. When in doubt, keep the value that matches the schema field type most exactly
</thinking>

<rules>
- Produce a single JSON object following the schema exactly
- When values conflict, pick the simpler atomic value (see field-separation)
- Never combine two fields into one (no joining city+state, no concatenation)
- Output ONLY valid JSON - no markdown, no explanations
</rules>`;

  const user = `<json-schema>
${schema}
</json-schema>

<json-objects>
${jsonObjects}
</json-objects>`;

  return { system, user };
};
