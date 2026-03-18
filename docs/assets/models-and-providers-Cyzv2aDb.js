import{j as e,aE as n}from"./main-BiZqUaIh.js";let a=`

import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';

Struktur is built on the [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction), which provides a unified interface to multiple LLM providers. This architecture makes it straightforward to use any model from supported providers—or add new ones.

Supported Providers [#supported-providers]

Struktur currently supports the following providers out of the box:

| Provider       | Environment Variable           | Package                       |
| -------------- | ------------------------------ | ----------------------------- |
| **OpenAI**     | \`OPENAI_API_KEY\`               | \`@ai-sdk/openai\`              |
| **Anthropic**  | \`ANTHROPIC_API_KEY\`            | \`@ai-sdk/anthropic\`           |
| **Google**     | \`GOOGLE_GENERATIVE_AI_API_KEY\` | \`@ai-sdk/google\`              |
| **OpenCode**   | \`OPENCODE_API_KEY\`             | \`@ai-sdk/openai\`\\*            |
| **OpenRouter** | \`OPENROUTER_API_KEY\`           | \`@openrouter/ai-sdk-provider\` |

\\*OpenCode uses the OpenAI-compatible API via the Vercel SDK's OpenAI provider.

<Callout type="info">
  **Model names change frequently.** Rather than document specific models, Struktur focuses on provider integration. Check your provider's documentation for available models and their capabilities.
</Callout>

Specifying Models [#specifying-models]

Models are specified using the format \`provider/model-name\`:

\`\`\`typescript
import { extract } from "@struktur/sdk";

// OpenAI
const result = await extract({
  artifacts,
  schema,
  strategy: { type: "simple", model: "openai/gpt-4o" }
});

// Anthropic
const result = await extract({
  artifacts,
  schema,
  strategy: { type: "simple", model: "anthropic/claude-3-5-sonnet" }
});

// Google
const result = await extract({
  artifacts,
  schema,
  strategy: { type: "simple", model: "google/gemini-1.5-pro" }
});
\`\`\`

Authentication [#authentication]

Struktur supports two authentication methods:

Environment Variables [#environment-variables]

Set the appropriate API key for your provider:

\`\`\`bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GOOGLE_GENERATIVE_AI_API_KEY="..."
export OPENCODE_API_KEY="..."
export OPENROUTER_API_KEY="..."
\`\`\`

Secure Token Storage [#secure-token-storage]

For CLI usage, Struktur can store tokens securely:

\`\`\`bash
# Store in macOS Keychain (preferred on macOS)
struktur auth set --provider openai --token "sk-..."

# Or store in file
struktur auth set --provider openai --token "sk-..." --storage file
\`\`\`

<Callout type="info">
  On macOS, Struktur defaults to the system Keychain. On other platforms, tokens are stored in \`~/.config/struktur/tokens.json\` with strict permissions (\`0o600\`).
</Callout>

Special Providers [#special-providers]

OpenCode (PyCoding Agent) [#opencode-pycoding-agent]

OpenCode provides access to multiple model families through a single API:

\`\`\`typescript
// OpenAI-compatible models
"opencode/gpt-5.2"
"opencode/gpt-5.1"

// Anthropic-compatible models
"opencode/claude-opus-4-6"
"opencode/claude-sonnet-4-5"

// Google-compatible models
"opencode/gemini-3.1-pro"
"opencode/gemini-3-flash"

// Other providers
"opencode/kimi-k2.5"
"opencode/glm-5"
\`\`\`

Struktur automatically routes OpenCode requests to the correct Vercel SDK provider based on the model prefix (\`gpt-\`, \`claude-\`, \`gemini-\`).

OpenRouter [#openrouter]

OpenRouter provides access to models from multiple providers through a unified API. You can also specify a preferred upstream provider:

\`\`\`typescript
// Basic usage
"openrouter/anthropic/claude-3.5-sonnet"

// With preferred provider (using hashtag syntax)
"openrouter/anthropic/claude-3.5-sonnet#octoai"
\`\`\`

Adding New Providers [#adding-new-providers]

Because Struktur uses the Vercel AI SDK, adding support for new providers is straightforward:

1. **Check if Vercel AI SDK supports the provider**

   The Vercel AI SDK has a growing ecosystem of [community providers](https://sdk.vercel.ai/providers/community-providers). If your provider is listed there, integration is simple.

2. **Create a provider resolver**

   Add a case to \`resolveModel\` in \`packages/sdk/src/llm/resolveModel.ts\`:

   \`\`\`typescript
   case "newprovider": {
     const { createNewProvider } = await import("@ai-sdk/newprovider");
     return createNewProvider({ apiKey })(modelName);
   }
   \`\`\`

3. **Add environment variable mapping**

   Update \`resolveProviderEnvVar\` in \`packages/sdk/src/auth/tokens.ts\`:

   \`\`\`typescript
   case "newprovider":
     return "NEWPROVIDER_API_KEY";
   \`\`\`

4. **(Optional) Add model listing support**

   If the provider has a models API, add support in \`packages/sdk/src/llm/models.ts\`.

Model Capabilities [#model-capabilities]

When selecting a model, consider:

| Capability            | Considerations                                                   |
| --------------------- | ---------------------------------------------------------------- |
| **Structured Output** | All supported providers support JSON schema output               |
| **Vision/Multimodal** | Check if the model supports image input for PDF/image extraction |
| **Context Window**    | Larger documents require models with larger context windows      |
| **Rate Limits**       | Consider provider rate limits for batch processing               |
| **Cost**              | Different models have vastly different pricing                   |

<Callout type="warning">
  Not all models support image inputs. If you're extracting from PDFs or images with visual content, use a vision-capable model (e.g., GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro).
</Callout>

Listing Available Models [#listing-available-models]

The CLI can list available models from configured providers:

\`\`\`bash
# List models for a specific provider
struktur models --provider openai

# List models for all configured providers
struktur models

# Pick the cheapest available model
struktur extract --model cheapest --provider openai
\`\`\`

See Also [#see-also]

* [Extraction Strategies](/docs/explanation/strategies) — How strategies use models
* [CLI Authentication](/docs/cli/config) — Managing provider tokens
* [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs) — Full provider documentation
`,l={title:"Models and Providers",description:"How Struktur integrates with LLM providers through the Vercel AI SDK."},d={contents:[{heading:void 0,content:"Struktur is built on the Vercel AI SDK, which provides a unified interface to multiple LLM providers. This architecture makes it straightforward to use any model from supported providers—or add new ones."},{heading:"supported-providers",content:"Struktur currently supports the following providers out of the box:"},{heading:"supported-providers",content:"Provider"},{heading:"supported-providers",content:"Environment Variable"},{heading:"supported-providers",content:"Package"},{heading:"supported-providers",content:"**OpenAI**"},{heading:"supported-providers",content:"`OPENAI_API_KEY`"},{heading:"supported-providers",content:"`@ai-sdk/openai`"},{heading:"supported-providers",content:"**Anthropic**"},{heading:"supported-providers",content:"`ANTHROPIC_API_KEY`"},{heading:"supported-providers",content:"`@ai-sdk/anthropic`"},{heading:"supported-providers",content:"**Google**"},{heading:"supported-providers",content:"`GOOGLE_GENERATIVE_AI_API_KEY`"},{heading:"supported-providers",content:"`@ai-sdk/google`"},{heading:"supported-providers",content:"**OpenCode**"},{heading:"supported-providers",content:"`OPENCODE_API_KEY`"},{heading:"supported-providers",content:"`@ai-sdk/openai`\\*"},{heading:"supported-providers",content:"**OpenRouter**"},{heading:"supported-providers",content:"`OPENROUTER_API_KEY`"},{heading:"supported-providers",content:"`@openrouter/ai-sdk-provider`"},{heading:"supported-providers",content:"\\*OpenCode uses the OpenAI-compatible API via the Vercel SDK's OpenAI provider."},{heading:"supported-providers",content:"**Model names change frequently.** Rather than document specific models, Struktur focuses on provider integration. Check your provider's documentation for available models and their capabilities."},{heading:"specifying-models",content:"Models are specified using the format `provider/model-name`:"},{heading:"authentication",content:"Struktur supports two authentication methods:"},{heading:"environment-variables",content:"Set the appropriate API key for your provider:"},{heading:"secure-token-storage",content:"For CLI usage, Struktur can store tokens securely:"},{heading:"secure-token-storage",content:"On macOS, Struktur defaults to the system Keychain. On other platforms, tokens are stored in `~/.config/struktur/tokens.json` with strict permissions (`0o600`)."},{heading:"opencode-pycoding-agent",content:"OpenCode provides access to multiple model families through a single API:"},{heading:"opencode-pycoding-agent",content:"Struktur automatically routes OpenCode requests to the correct Vercel SDK provider based on the model prefix (`gpt-`, `claude-`, `gemini-`)."},{heading:"openrouter",content:"OpenRouter provides access to models from multiple providers through a unified API. You can also specify a preferred upstream provider:"},{heading:"adding-new-providers",content:"Because Struktur uses the Vercel AI SDK, adding support for new providers is straightforward:"},{heading:"adding-new-providers",content:"**Check if Vercel AI SDK supports the provider**"},{heading:"adding-new-providers",content:"The Vercel AI SDK has a growing ecosystem of community providers. If your provider is listed there, integration is simple."},{heading:"adding-new-providers",content:"**Create a provider resolver**"},{heading:"adding-new-providers",content:"Add a case to `resolveModel` in `packages/sdk/src/llm/resolveModel.ts`:"},{heading:"adding-new-providers",content:"**Add environment variable mapping**"},{heading:"adding-new-providers",content:"Update `resolveProviderEnvVar` in `packages/sdk/src/auth/tokens.ts`:"},{heading:"adding-new-providers",content:"**(Optional) Add model listing support**"},{heading:"adding-new-providers",content:"If the provider has a models API, add support in `packages/sdk/src/llm/models.ts`."},{heading:"model-capabilities",content:"When selecting a model, consider:"},{heading:"model-capabilities",content:"Capability"},{heading:"model-capabilities",content:"Considerations"},{heading:"model-capabilities",content:"**Structured Output**"},{heading:"model-capabilities",content:"All supported providers support JSON schema output"},{heading:"model-capabilities",content:"**Vision/Multimodal**"},{heading:"model-capabilities",content:"Check if the model supports image input for PDF/image extraction"},{heading:"model-capabilities",content:"**Context Window**"},{heading:"model-capabilities",content:"Larger documents require models with larger context windows"},{heading:"model-capabilities",content:"**Rate Limits**"},{heading:"model-capabilities",content:"Consider provider rate limits for batch processing"},{heading:"model-capabilities",content:"**Cost**"},{heading:"model-capabilities",content:"Different models have vastly different pricing"},{heading:"model-capabilities",content:"Not all models support image inputs. If you're extracting from PDFs or images with visual content, use a vision-capable model (e.g., GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)."},{heading:"listing-available-models",content:"The CLI can list available models from configured providers:"},{heading:"see-also",content:"Extraction Strategies — How strategies use models"},{heading:"see-also",content:"CLI Authentication — Managing provider tokens"},{heading:"see-also",content:"Vercel AI SDK Documentation — Full provider documentation"}],headings:[{id:"supported-providers",content:"Supported Providers"},{id:"specifying-models",content:"Specifying Models"},{id:"authentication",content:"Authentication"},{id:"environment-variables",content:"Environment Variables"},{id:"secure-token-storage",content:"Secure Token Storage"},{id:"special-providers",content:"Special Providers"},{id:"opencode-pycoding-agent",content:"OpenCode (PyCoding Agent)"},{id:"openrouter",content:"OpenRouter"},{id:"adding-new-providers",content:"Adding New Providers"},{id:"model-capabilities",content:"Model Capabilities"},{id:"listing-available-models",content:"Listing Available Models"},{id:"see-also",content:"See Also"}]};const h=[{depth:2,url:"#supported-providers",title:e.jsx(e.Fragment,{children:"Supported Providers"})},{depth:2,url:"#specifying-models",title:e.jsx(e.Fragment,{children:"Specifying Models"})},{depth:2,url:"#authentication",title:e.jsx(e.Fragment,{children:"Authentication"})},{depth:3,url:"#environment-variables",title:e.jsx(e.Fragment,{children:"Environment Variables"})},{depth:3,url:"#secure-token-storage",title:e.jsx(e.Fragment,{children:"Secure Token Storage"})},{depth:2,url:"#special-providers",title:e.jsx(e.Fragment,{children:"Special Providers"})},{depth:3,url:"#opencode-pycoding-agent",title:e.jsx(e.Fragment,{children:"OpenCode (PyCoding Agent)"})},{depth:3,url:"#openrouter",title:e.jsx(e.Fragment,{children:"OpenRouter"})},{depth:2,url:"#adding-new-providers",title:e.jsx(e.Fragment,{children:"Adding New Providers"})},{depth:2,url:"#model-capabilities",title:e.jsx(e.Fragment,{children:"Model Capabilities"})},{depth:2,url:"#listing-available-models",title:e.jsx(e.Fragment,{children:"Listing Available Models"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See Also"})}];function r(s){const i={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["Struktur is built on the ",e.jsx(i.a,{href:"https://sdk.vercel.ai/docs/introduction",children:"Vercel AI SDK"}),", which provides a unified interface to multiple LLM providers. This architecture makes it straightforward to use any model from supported providers—or add new ones."]}),`
`,e.jsx(i.h2,{id:"supported-providers",children:"Supported Providers"}),`
`,e.jsx(i.p,{children:"Struktur currently supports the following providers out of the box:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Provider"}),e.jsx(i.th,{children:"Environment Variable"}),e.jsx(i.th,{children:"Package"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"OpenAI"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENAI_API_KEY"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"@ai-sdk/openai"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Anthropic"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"ANTHROPIC_API_KEY"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"@ai-sdk/anthropic"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Google"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"GOOGLE_GENERATIVE_AI_API_KEY"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"@ai-sdk/google"})})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"OpenCode"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENCODE_API_KEY"})}),e.jsxs(i.td,{children:[e.jsx(i.code,{children:"@ai-sdk/openai"}),"*"]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"OpenRouter"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"OPENROUTER_API_KEY"})}),e.jsx(i.td,{children:e.jsx(i.code,{children:"@openrouter/ai-sdk-provider"})})]})]})]}),`
`,e.jsx(i.p,{children:"*OpenCode uses the OpenAI-compatible API via the Vercel SDK's OpenAI provider."}),`
`,e.jsx(n,{type:"info",children:e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Model names change frequently."})," Rather than document specific models, Struktur focuses on provider integration. Check your provider's documentation for available models and their capabilities."]})}),`
`,e.jsx(i.h2,{id:"specifying-models",children:"Specifying Models"}),`
`,e.jsxs(i.p,{children:["Models are specified using the format ",e.jsx(i.code,{children:"provider/model-name"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" { extract } "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "@struktur/sdk"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// OpenAI"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: { type: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"simple"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", model: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"openai/gpt-4o"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Anthropic"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: { type: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"simple"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", model: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"anthropic/claude-3-5-sonnet"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Google"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: { type: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"simple"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", model: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"google/gemini-1.5-pro"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"authentication",children:"Authentication"}),`
`,e.jsx(i.p,{children:"Struktur supports two authentication methods:"}),`
`,e.jsx(i.h3,{id:"environment-variables",children:"Environment Variables"}),`
`,e.jsx(i.p,{children:"Set the appropriate API key for your provider:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENAI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"sk-..."'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ANTHROPIC_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"sk-ant-..."'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" GOOGLE_GENERATIVE_AI_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"..."'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENCODE_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"..."'})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"export"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENROUTER_API_KEY"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"..."'})]})]})})}),`
`,e.jsx(i.h3,{id:"secure-token-storage",children:"Secure Token Storage"}),`
`,e.jsx(i.p,{children:"For CLI usage, Struktur can store tokens securely:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Store in macOS Keychain (preferred on macOS)"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "sk-..."'})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Or store in file"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" auth"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --token"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "sk-..."'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --storage"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" file"})]})]})})}),`
`,e.jsx(n,{type:"info",children:e.jsxs(i.p,{children:["On macOS, Struktur defaults to the system Keychain. On other platforms, tokens are stored in ",e.jsx(i.code,{children:"~/.config/struktur/tokens.json"})," with strict permissions (",e.jsx(i.code,{children:"0o600"}),")."]})}),`
`,e.jsx(i.h2,{id:"special-providers",children:"Special Providers"}),`
`,e.jsx(i.h3,{id:"opencode-pycoding-agent",children:"OpenCode (PyCoding Agent)"}),`
`,e.jsx(i.p,{children:"OpenCode provides access to multiple model families through a single API:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// OpenAI-compatible models"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/gpt-5.2"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/gpt-5.1"'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Anthropic-compatible models"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/claude-opus-4-6"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/claude-sonnet-4-5"'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Google-compatible models"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/gemini-3.1-pro"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/gemini-3-flash"'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Other providers"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/kimi-k2.5"'})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"opencode/glm-5"'})})]})})}),`
`,e.jsxs(i.p,{children:["Struktur automatically routes OpenCode requests to the correct Vercel SDK provider based on the model prefix (",e.jsx(i.code,{children:"gpt-"}),", ",e.jsx(i.code,{children:"claude-"}),", ",e.jsx(i.code,{children:"gemini-"}),")."]}),`
`,e.jsx(i.h3,{id:"openrouter",children:"OpenRouter"}),`
`,e.jsx(i.p,{children:"OpenRouter provides access to models from multiple providers through a unified API. You can also specify a preferred upstream provider:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// Basic usage"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"openrouter/anthropic/claude-3.5-sonnet"'})}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// With preferred provider (using hashtag syntax)"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"openrouter/anthropic/claude-3.5-sonnet#octoai"'})})]})})}),`
`,e.jsx(i.h2,{id:"adding-new-providers",children:"Adding New Providers"}),`
`,e.jsx(i.p,{children:"Because Struktur uses the Vercel AI SDK, adding support for new providers is straightforward:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Check if Vercel AI SDK supports the provider"})}),`
`,e.jsxs(i.p,{children:["The Vercel AI SDK has a growing ecosystem of ",e.jsx(i.a,{href:"https://sdk.vercel.ai/providers/community-providers",children:"community providers"}),". If your provider is listed there, integration is simple."]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Create a provider resolver"})}),`
`,e.jsxs(i.p,{children:["Add a case to ",e.jsx(i.code,{children:"resolveModel"})," in ",e.jsx(i.code,{children:"packages/sdk/src/llm/resolveModel.ts"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"case"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "newprovider"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  const { createNewProvider } = await "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"import"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"@ai-sdk/newprovider"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  return "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createNewProvider"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"apiKey"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" })("}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"modelName"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"Add environment variable mapping"})}),`
`,e.jsxs(i.p,{children:["Update ",e.jsx(i.code,{children:"resolveProviderEnvVar"})," in ",e.jsx(i.code,{children:"packages/sdk/src/auth/tokens.ts"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"case"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "newprovider"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  return"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "NEWPROVIDER_API_KEY"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]})]})})}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsx(i.p,{children:e.jsx(i.strong,{children:"(Optional) Add model listing support"})}),`
`,e.jsxs(i.p,{children:["If the provider has a models API, add support in ",e.jsx(i.code,{children:"packages/sdk/src/llm/models.ts"}),"."]}),`
`]}),`
`]}),`
`,e.jsx(i.h2,{id:"model-capabilities",children:"Model Capabilities"}),`
`,e.jsx(i.p,{children:"When selecting a model, consider:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Capability"}),e.jsx(i.th,{children:"Considerations"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Structured Output"})}),e.jsx(i.td,{children:"All supported providers support JSON schema output"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Vision/Multimodal"})}),e.jsx(i.td,{children:"Check if the model supports image input for PDF/image extraction"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Context Window"})}),e.jsx(i.td,{children:"Larger documents require models with larger context windows"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Rate Limits"})}),e.jsx(i.td,{children:"Consider provider rate limits for batch processing"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:e.jsx(i.strong,{children:"Cost"})}),e.jsx(i.td,{children:"Different models have vastly different pricing"})]})]})]}),`
`,e.jsx(n,{type:"warning",children:e.jsx(i.p,{children:"Not all models support image inputs. If you're extracting from PDFs or images with visual content, use a vision-capable model (e.g., GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)."})}),`
`,e.jsx(i.h2,{id:"listing-available-models",children:"Listing Available Models"}),`
`,e.jsx(i.p,{children:"The CLI can list available models from configured providers:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# List models for a specific provider"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# List models for all configured providers"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"})]}),`
`,e.jsx(i.span,{className:"line"}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Pick the cheapest available model"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"struktur"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --model"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cheapest"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --provider"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai"})]})]})})}),`
`,e.jsx(i.h2,{id:"see-also",children:"See Also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies",children:"Extraction Strategies"})," — How strategies use models"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/config",children:"CLI Authentication"})," — Managing provider tokens"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"https://sdk.vercel.ai/docs",children:"Vercel AI SDK Documentation"})," — Full provider documentation"]}),`
`]})]})}function o(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(r,{...s})}):r(s)}export{a as _markdown,o as default,l as frontmatter,d as structuredData,h as toc};
