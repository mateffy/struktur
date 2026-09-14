import{j as i,aE as n}from"./main-DRw0BXZL.js";let a=`

import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';

Struktur distributes a standalone binary that bundles Node.js and all dependencies. Download it from GitHub Releases or build it from source.

Prerequisites [#prerequisites]

* Docker Engine 24 or newer.
* An API key for your LLM provider.

Dockerfile [#dockerfile]

Download the binary from the latest GitHub release and copy it into your image:

\`\`\`dockerfile
FROM alpine:3.21 AS downloader
RUN wget -O /struktur https://github.com/mateffy/struktur/releases/latest/download/struktur-linux-x64 \\
    && chmod +x /struktur

FROM your-base-image
COPY --from=downloader /struktur /usr/local/bin/struktur

ENV OPENAI_API_KEY=""
\`\`\`

<Callout type="info">
  The binary targets Linux x64. For ARM64, use \`struktur-linux-arm64\`. The binary has no system dependencies beyond \`glibc\` (Alpine needs \`gcompat\`).
</Callout>

PHP application [#php-application]

For PHP applications that use the [PHP SDK](/docs/sdk/php):

\`\`\`dockerfile
FROM alpine:3.21 AS downloader
RUN wget -O /struktur https://github.com/mateffy/struktur/releases/latest/download/struktur-linux-x64 \\
    && chmod +x /struktur

FROM php:8.3-cli-bookworm

# Copy the standalone binary
COPY --from=downloader /struktur /usr/local/bin/struktur

# Install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction
COPY . .

ENV OPENAI_API_KEY=""
\`\`\`

docker-compose.yml [#docker-composeyml]

\`\`\`yaml
services:
  app:
    build: .
    environment:
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
\`\`\`

Authentication [#authentication]

Docker containers do not have macOS Keychain. Use environment variables to authenticate. Set one or more of these variables:

| Variable                       | Provider   |
| ------------------------------ | ---------- |
| \`OPENAI_API_KEY\`               | OpenAI     |
| \`ANTHROPIC_API_KEY\`            | Anthropic  |
| \`GOOGLE_GENERATIVE_AI_API_KEY\` | Google     |
| \`OPENCODE_API_KEY\`             | OpenCode   |
| \`OPENROUTER_API_KEY\`           | OpenRouter |
| \`OLLAMA_BASE_URL\`              | Ollama     |

You can also mount a \`tokens.json\` file for authentication:

\`\`\`yaml
volumes:
  - ./tokens.json:/root/.config/struktur/tokens.json:ro
\`\`\`

<Callout type="warn">
  Do not put API keys in your Dockerfile. Use Docker secrets, an \`.env\` file, or a secrets manager.
</Callout>

Per-command tokens [#per-command-tokens]

Prefix the command with environment variables for per-command token overrides:

\`\`\`bash
docker run --rm my-app \\
  sh -c 'OPENAI_API_KEY=sk-xxx struktur extract --model openai/gpt-4o --input doc.pdf --fields "title"'
\`\`\`

In the [PHP SDK](/docs/sdk/php), pass tokens as an array. The SDK builds the env prefix automatically:

\`\`\`php
$result = $client->extract(new ExtractionRequest(
    inputs: [Input::fromPath('./invoice.pdf')],
    schema: $schema,
    model: 'openai/gpt-4o',
    tokens: ['openai' => 'sk-xxx'],
));
\`\`\`

Set a default model [#set-a-default-model]

\`\`\`bash
docker run --rm \\
  -e OPENAI_API_KEY=$OPENAI_API_KEY \\
  my-app \\
  struktur config models use openai/gpt-4o-mini
\`\`\`

Examples [#examples]

Extract data from a PDF [#extract-data-from-a-pdf]

\`\`\`bash
docker run --rm \\
  -e OPENAI_API_KEY=$OPENAI_API_KEY \\
  -v $(pwd)/documents:/docs:ro \\
  my-app \\
  struktur extract \\
    --input /docs/invoice.pdf \\
    --model openai/gpt-4o-mini \\
    --fields "invoice_number, date, total, line_items"
\`\`\`

Parse a PDF into artifacts [#parse-a-pdf-into-artifacts]

\`\`\`bash
docker run --rm \\
  -e OPENAI_API_KEY=$OPENAI_API_KEY \\
  -v $(pwd)/documents:/docs:ro \\
  my-app \\
  struktur parse --input /docs/report.pdf --output -
\`\`\`

Building the binary [#building-the-binary]

Build the standalone binary from source:

\`\`\`bash
cd packages/cli
bun install
bun run build          # compiles TypeScript
bun run build:binary   # creates dist/struktur (~71MB)
\`\`\`

The binary bundles Bun as its runtime. Optional dependencies (\`@mongodb-js/zstd\`, \`@langfuse/otel\`) are marked external — they are loaded dynamically at runtime if installed.

See also [#see-also]

* [Installation & Setup](/docs/cli/installation) — all environment variables
* [Config](/docs/cli/config) — provider and model management
* [PHP SDK](/docs/sdk/php) — use Struktur from PHP
`,h={title:"Docker",description:"Run Struktur in a Docker container using the standalone binary."},r={contents:[{heading:void 0,content:"Struktur distributes a standalone binary that bundles Node.js and all dependencies. Download it from GitHub Releases or build it from source."},{heading:"prerequisites",content:"Docker Engine 24 or newer."},{heading:"prerequisites",content:"An API key for your LLM provider."},{heading:"dockerfile",content:"Download the binary from the latest GitHub release and copy it into your image:"},{heading:"dockerfile",content:"The binary targets Linux x64. For ARM64, use `struktur-linux-arm64`. The binary has no system dependencies beyond `glibc` (Alpine needs `gcompat`)."},{heading:"php-application",content:"For PHP applications that use the PHP SDK:"},{heading:"authentication",content:"Docker containers do not have macOS Keychain. Use environment variables to authenticate. Set one or more of these variables:"},{heading:"authentication",content:"Variable"},{heading:"authentication",content:"Provider"},{heading:"authentication",content:"`OPENAI_API_KEY`"},{heading:"authentication",content:"OpenAI"},{heading:"authentication",content:"`ANTHROPIC_API_KEY`"},{heading:"authentication",content:"Anthropic"},{heading:"authentication",content:"`GOOGLE_GENERATIVE_AI_API_KEY`"},{heading:"authentication",content:"Google"},{heading:"authentication",content:"`OPENCODE_API_KEY`"},{heading:"authentication",content:"OpenCode"},{heading:"authentication",content:"`OPENROUTER_API_KEY`"},{heading:"authentication",content:"OpenRouter"},{heading:"authentication",content:"`OLLAMA_BASE_URL`"},{heading:"authentication",content:"Ollama"},{heading:"authentication",content:"You can also mount a `tokens.json` file for authentication:"},{heading:"authentication",content:"Do not put API keys in your Dockerfile. Use Docker secrets, an `.env` file, or a secrets manager."},{heading:"per-command-tokens",content:"Prefix the command with environment variables for per-command token overrides:"},{heading:"per-command-tokens",content:"In the PHP SDK, pass tokens as an array. The SDK builds the env prefix automatically:"},{heading:"building-the-binary",content:"Build the standalone binary from source:"},{heading:"building-the-binary",content:"The binary bundles Bun as its runtime. Optional dependencies (`@mongodb-js/zstd`, `@langfuse/otel`) are marked external — they are loaded dynamically at runtime if installed."},{heading:"see-also",content:"Installation & Setup — all environment variables"},{heading:"see-also",content:"Config — provider and model management"},{heading:"see-also",content:"PHP SDK — use Struktur from PHP"}],headings:[{id:"prerequisites",content:"Prerequisites"},{id:"dockerfile",content:"Dockerfile"},{id:"php-application",content:"PHP application"},{id:"docker-composeyml",content:"docker-compose.yml"},{id:"authentication",content:"Authentication"},{id:"per-command-tokens",content:"Per-command tokens"},{id:"set-a-default-model",content:"Set a default model"},{id:"examples",content:"Examples"},{id:"extract-data-from-a-pdf",content:"Extract data from a PDF"},{id:"parse-a-pdf-into-artifacts",content:"Parse a PDF into artifacts"},{id:"building-the-binary",content:"Building the binary"},{id:"see-also",content:"See also"}]};const d=[{depth:2,url:"#prerequisites",title:i.jsx(i.Fragment,{children:"Prerequisites"})},{depth:2,url:"#dockerfile",title:i.jsx(i.Fragment,{children:"Dockerfile"})},{depth:3,url:"#php-application",title:i.jsx(i.Fragment,{children:"PHP application"})},{depth:2,url:"#docker-composeyml",title:i.jsx(i.Fragment,{children:"docker-compose.yml"})},{depth:2,url:"#authentication",title:i.jsx(i.Fragment,{children:"Authentication"})},{depth:2,url:"#per-command-tokens",title:i.jsx(i.Fragment,{children:"Per-command tokens"})},{depth:2,url:"#set-a-default-model",title:i.jsx(i.Fragment,{children:"Set a default model"})},{depth:2,url:"#examples",title:i.jsx(i.Fragment,{children:"Examples"})},{depth:3,url:"#extract-data-from-a-pdf",title:i.jsx(i.Fragment,{children:"Extract data from a PDF"})},{depth:3,url:"#parse-a-pdf-into-artifacts",title:i.jsx(i.Fragment,{children:"Parse a PDF into artifacts"})},{depth:2,url:"#building-the-binary",title:i.jsx(i.Fragment,{children:"Building the binary"})},{depth:2,url:"#see-also",title:i.jsx(i.Fragment,{children:"See also"})}];function t(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...e.components};return i.jsxs(i.Fragment,{children:[i.jsx(s.p,{children:"Struktur distributes a standalone binary that bundles Node.js and all dependencies. Download it from GitHub Releases or build it from source."}),`
`,i.jsx(s.h2,{id:"prerequisites",children:"Prerequisites"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsx(s.li,{children:"Docker Engine 24 or newer."}),`
`,i.jsx(s.li,{children:"An API key for your LLM provider."}),`
`]}),`
`,i.jsx(s.h2,{id:"dockerfile",children:"Dockerfile"}),`
`,i.jsx(s.p,{children:"Download the binary from the latest GitHub release and copy it into your image:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alpine:3.21 "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" downloader"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"RUN"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" wget -O /struktur https://github.com/mateffy/struktur/releases/latest/download/struktur-linux-x64 \\"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    && chmod +x /struktur"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" your-base-image"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"COPY"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" --from=downloader /struktur /usr/local/bin/struktur"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ENV"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENAI_API_KEY="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'""'})]})]})})}),`
`,i.jsx(n,{type:"info",children:i.jsxs(s.p,{children:["The binary targets Linux x64. For ARM64, use ",i.jsx(s.code,{children:"struktur-linux-arm64"}),". The binary has no system dependencies beyond ",i.jsx(s.code,{children:"glibc"})," (Alpine needs ",i.jsx(s.code,{children:"gcompat"}),")."]})}),`
`,i.jsx(s.h3,{id:"php-application",children:"PHP application"}),`
`,i.jsxs(s.p,{children:["For PHP applications that use the ",i.jsx(s.a,{href:"/docs/sdk/php",children:"PHP SDK"}),":"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alpine:3.21 "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"AS"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" downloader"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"RUN"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" wget -O /struktur https://github.com/mateffy/struktur/releases/latest/download/struktur-linux-x64 \\"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    && chmod +x /struktur"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"FROM"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" php:8.3-cli-bookworm"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Copy the standalone binary"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"COPY"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" --from=downloader /struktur /usr/local/bin/struktur"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Install PHP dependencies"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"COPY"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" composer.json composer.lock ./"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"RUN"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" composer install --no-dev --no-interaction"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"COPY"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" . ."})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"ENV"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" OPENAI_API_KEY="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'""'})]})]})})}),`
`,i.jsx(s.h2,{id:"docker-composeyml",children:"docker-compose.yml"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"services"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"  app"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    build"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"."})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"    environment"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      - "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"OPENAI_API_KEY=${OPENAI_API_KEY}"})]})]})})}),`
`,i.jsx(s.h2,{id:"authentication",children:"Authentication"}),`
`,i.jsx(s.p,{children:"Docker containers do not have macOS Keychain. Use environment variables to authenticate. Set one or more of these variables:"}),`
`,i.jsxs(s.table,{children:[i.jsx(s.thead,{children:i.jsxs(s.tr,{children:[i.jsx(s.th,{children:"Variable"}),i.jsx(s.th,{children:"Provider"})]})}),i.jsxs(s.tbody,{children:[i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"OPENAI_API_KEY"})}),i.jsx(s.td,{children:"OpenAI"})]}),i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"ANTHROPIC_API_KEY"})}),i.jsx(s.td,{children:"Anthropic"})]}),i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"GOOGLE_GENERATIVE_AI_API_KEY"})}),i.jsx(s.td,{children:"Google"})]}),i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"OPENCODE_API_KEY"})}),i.jsx(s.td,{children:"OpenCode"})]}),i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"OPENROUTER_API_KEY"})}),i.jsx(s.td,{children:"OpenRouter"})]}),i.jsxs(s.tr,{children:[i.jsx(s.td,{children:i.jsx(s.code,{children:"OLLAMA_BASE_URL"})}),i.jsx(s.td,{children:"Ollama"})]})]})]}),`
`,i.jsxs(s.p,{children:["You can also mount a ",i.jsx(s.code,{children:"tokens.json"})," file for authentication:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"volumes"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  - "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"./tokens.json:/root/.config/struktur/tokens.json:ro"})]})]})})}),`
`,i.jsx(n,{type:"warn",children:i.jsxs(s.p,{children:["Do not put API keys in your Dockerfile. Use Docker secrets, an ",i.jsx(s.code,{children:".env"})," file, or a secrets manager."]})}),`
`,i.jsx(s.h2,{id:"per-command-tokens",children:"Per-command tokens"}),`
`,i.jsx(s.p,{children:"Prefix the command with environment variables for per-command token overrides:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"docker"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rm"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" my-app"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  sh"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -c"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:` 'OPENAI_API_KEY=sk-xxx struktur extract --model openai/gpt-4o --input doc.pdf --fields "title"'`})]})]})})}),`
`,i.jsxs(s.p,{children:["In the ",i.jsx(s.a,{href:"/docs/sdk/php",children:"PHP SDK"}),", pass tokens as an array. The SDK builds the env prefix automatically:"]}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$result "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $client"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"extract"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" ExtractionRequest"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    inputs"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Input"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"::"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"fromPath"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'./invoice.pdf'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")],"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    schema"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": $schema,"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    model"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'openai/gpt-4o'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    tokens"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'openai'"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" =>"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'sk-xxx'"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"],"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})})]})})}),`
`,i.jsx(s.h2,{id:"set-a-default-model",children:"Set a default model"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"docker"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rm"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -e"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" OPENAI_API_KEY="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  my-app"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" config"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" models"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"})]})]})})}),`
`,i.jsx(s.h2,{id:"examples",children:"Examples"}),`
`,i.jsx(s.h3,{id:"extract-data-from-a-pdf",children:"Extract data from a PDF"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"docker"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rm"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -e"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" OPENAI_API_KEY="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -v"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"pwd"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/documents:/docs:ro"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  my-app"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    --input"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /docs/invoice.pdf"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    --model"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" openai/gpt-4o-mini"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    --fields"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "invoice_number, date, total, line_items"'})]})]})})}),`
`,i.jsx(s.h3,{id:"parse-a-pdf-into-artifacts",children:"Parse a PDF into artifacts"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"docker"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --rm"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -e"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" OPENAI_API_KEY="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"$OPENAI_API_KEY "}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  -v"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $("}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"pwd"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/documents:/docs:ro"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  my-app"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  struktur"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" parse"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --input"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /docs/report.pdf"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --output"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -"})]})]})})}),`
`,i.jsx(s.h2,{id:"building-the-binary",children:"Building the binary"}),`
`,i.jsx(s.p,{children:"Build the standalone binary from source:"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"cd"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" packages/cli"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" build"}),i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"          # compiles TypeScript"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bun"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" build:binary"}),i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   # creates dist/struktur (~71MB)"})]})]})})}),`
`,i.jsxs(s.p,{children:["The binary bundles Bun as its runtime. Optional dependencies (",i.jsx(s.code,{children:"@mongodb-js/zstd"}),", ",i.jsx(s.code,{children:"@langfuse/otel"}),") are marked external — they are loaded dynamically at runtime if installed."]}),`
`,i.jsx(s.h2,{id:"see-also",children:"See also"}),`
`,i.jsxs(s.ul,{children:[`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/docs/cli/installation",children:"Installation & Setup"})," — all environment variables"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/docs/cli/config",children:"Config"})," — provider and model management"]}),`
`,i.jsxs(s.li,{children:[i.jsx(s.a,{href:"/docs/sdk/php",children:"PHP SDK"})," — use Struktur from PHP"]}),`
`]})]})}function c(e={}){const{wrapper:s}=e.components||{};return s?i.jsx(s,{...e,children:i.jsx(t,{...e})}):t(e)}export{a as _markdown,c as default,h as frontmatter,r as structuredData,d as toc};
