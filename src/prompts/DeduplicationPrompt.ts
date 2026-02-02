export const buildDeduplicationPrompt = (
  schema: string,
  data: unknown,
  exampleKeys: string[] = ["items.3", "items.5"]
) => {
  const system = `You are a data deduplication tool.
You are given a JSON schema and some data in that format.
Your job is to identify duplicate entries and return the dot-notated paths to remove.
You MUST respond by calling the removeDuplicates tool.`;

  const user = `<json-schema>
${schema}
</json-schema>

<json-data>
${JSON.stringify(data)}
</json-data>

<example>
<tool-call>
removeDuplicates(${JSON.stringify({ keys: exampleKeys })})
</tool-call>
</example>`;

  return { system, user };
};
