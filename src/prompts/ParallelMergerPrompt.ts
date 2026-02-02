export const buildParallelMergerPrompt = (
  schema: string,
  dataList: unknown[]
) => {
  const jsonObjects = dataList
    .filter((item) => item !== null && item !== undefined)
    .map((item) => JSON.stringify(item))
    .map((json) => `<json-object>${json}</json-object>`)
    .join("\n");

  const system = `You are a structured data merger.
You are given a list of JSON objects that you need to merge into one JSON object.
Return a single JSON object that follows the provided schema.
MAKE SURE TO USE THE \`extract\` tool to merge the data. If you don't call the tool, the data will not be merged.`;

  const user = `<json-schema>
${schema}
</json-schema>

<json-objects>
${jsonObjects}
</json-objects>`;

  return { system, user };
};
