# Model Compatibility for Agent Strategy

## Requirements

The agent strategy requires models with **function calling / tool use** support. The model must be able to:

1. **Understand tool schemas** - Read parameter definitions and provide correct values
2. **Call tools by name** - Use exact tool names (read, bash, set_output_data, etc.)
3. **Provide required parameters** - Include all required fields in tool calls
4. **Use JSON format** - Pass parameters as properly formatted JSON objects

## Compatible Models

### ✅ Well-Supported

These models are known to work well with the agent strategy:

- **Anthropic Claude Sonnet 4.6** (`anthropic/claude-sonnet-4-6`) - Best overall, new default
- **Anthropic Claude Opus 4.6** (`anthropic/claude-opus-4-6`) - Most capable for complex tasks
- **OpenAI GPT-5.2** (`openai/gpt-5.2`) - Latest flagship model
- **OpenAI GPT-4.1** (`openai/gpt-4.1`) - Strong coding and instruction following
- **OpenAI GPT-4.1-mini** (`openai/gpt-4.1-mini`) - Cost-effective, beats GPT-4o
- **Google Gemini 3.1 Pro** (`google/gemini-3.1-pro`) - Complex problem-solving
- **Google Gemini 3.1 Flash-Lite** (`google/gemini-3.1-flash-lite`) - Fast and cost-efficient

### ⚠️ Partial Support

These models may work but have limitations:

- **OpenRouter models** - Tool calling support varies by provider
- **Google Gemini** - Function calling is supported but format may differ

### ❌ Not Compatible

These models are known to have issues with tool calling:

- **GLM-5 via OpenRouter** (`opencode/glm-5`) - Does not properly support tool calling
  - Calls tools with empty arguments
  - Uses incorrect tool names
  - Cannot follow tool schemas

## Testing Tool Calling

To verify if a model supports tool calling, you can test with a simple extraction:

```bash
struktur extract \
  --text "Company: Acme Corp" \
  --schema '{"type":"object","properties":{"company":{"type":"string"}}}' \
  --strategy agent \
  --model <provider>/<model>
```

If the agent successfully calls tools and extracts data, the model is compatible.

## Error Signs

If you see these errors, your model likely doesn't support tool calling:

```
Validation failed for tool "read":
  - file_path: must have required property 'file_path'
Received arguments: {}
```

Or:

```
Tool  not found
```

## Recommendations

1. **Use Claude Sonnet 4.6 or GPT-5.2** for best results
2. **Use GPT-4.1-mini or Gemini 3.1 Flash-Lite** for cost-effective extraction
3. **Avoid models without explicit tool calling support**
4. **Test with simple extractions first** before complex documents
5. **Check model documentation** for function calling capabilities

## Workarounds

If your preferred model doesn't support tools:

1. Use the `simple` strategy instead: `--strategy simple`
2. Try a different model from the same provider
3. Use Anthropic or OpenAI models which have the best tool support
