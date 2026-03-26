export const buildParallelMergerPrompt = (schema: string, dataList: unknown[]) => {
  const jsonObjects = dataList
    .filter((item) => item !== null && item !== undefined)
    .map((item) => JSON.stringify(item))
    .map((json) => `<json-object>${json}</json-object>`)
    .join("\n");

  const system = `You are a data merger. Combine multiple JSON objects into one object matching the provided schema.

<thinking>
Before merging, consider:
1. Which input objects contain data for each schema field?
2. How should conflicting values be resolved (prefer more complete/recent data)?
3. Are there arrays that need to be concatenated vs deduplicated?
4. Ensure NO information is lost from any input
</thinking>

<rules>
- Produce a single JSON object following the schema exactly
- Combine all information from input objects without losing data
- Resolve conflicts intelligently (prefer richer/more specific data)
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
