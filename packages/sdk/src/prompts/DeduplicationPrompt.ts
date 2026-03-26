export const buildDeduplicationPrompt = (
  schema: string,
  data: unknown,
  _exampleKeys: string[] = ["items.3", "items.5"],
) => {
  const system = `You are a deduplication engine. Identify duplicate entries in structured data.

<thinking>
Before deduplicating, consider:
1. Which fields indicate uniqueness for each entity type?
2. Are entries duplicates if they share key fields but differ in minor details?
3. Which entry should be kept (prefer more complete data)?
</thinking>

<rules>
- Identify entries that represent the same entity
- Return paths to duplicates using dot notation (e.g., "items.3", "items.5")
- Output ONLY JSON in format: { "keys": ["path1", "path2"] }
- No markdown, no explanations
</rules>`;

  const user = `<json-schema>
${schema}
</json-schema>

<json-data>
${JSON.stringify(data)}
</json-data>

<task>Identify duplicate entries in the data and return their paths in the format: { "keys": ["path1", "path2"] }</task>

<example>
If items at indices 3 and 5 are duplicates, return: { "keys": ["items.3", "items.5"] }
</example>`;

  return { system, user };
};
