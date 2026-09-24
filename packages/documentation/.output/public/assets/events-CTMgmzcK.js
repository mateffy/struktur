import{j as e,az as n,aE as a}from"./main-CJmI79fM.js";let r=`

import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Callout } from 'fumadocs-ui/components/callout';

Available events [#available-events]

<TypeTable
  type={{
  onStep: {
    description: 'Fired at each named phase within a strategy',
    type: '(info: { step: number; total?: number; label?: string }) => void',
    required: false,
  },
  onMessage: {
    description: 'Fired for every message in the LLM conversation',
    type: '(msg: { role: string; content: unknown }) => void',
    required: false,
  },
  onProgress: {
    description: 'Fired when a strategy can report percentage progress',
    type: '(progress: number) => void',
    required: false,
  },
  onTokenUsage: {
    description: 'Fired after each LLM call with token usage',
    type: '(usage: { inputTokens: number; outputTokens: number; totalTokens: number }) => void',
    required: false,
  },
  onRetry: {
    description: 'Fired when a step is retried after a validation or provider failure',
    type: '(info: { attempt: number; maxAttempts: number; reason?: string }) => void',
    required: false,
  },
  onStatus: {
    description: 'Human-facing status update with a coarse, strategy-independent phase',
    type: '(info: { phase: StatusPhase; message?: { key: string; params?: Record<string, string | number> }; percent?: number | null }) => void',
    required: false,
  },
}}
/>

Agent events [#agent-events]

These fire only from the agent strategy. Use them to render a live activity feed of what the model is doing — which tools it called, what it reasoned, and whether it can actually see images.

<TypeTable
  type={{
  onAgentToolStart: {
    description: 'A tool call starts. \`toolName\` is the agent tool (\`read\`, \`grep\`, \`list\`, \`view_image\`, \`set_output_data\`, …), \`args\` are its arguments as sent by the model.',
    type: '(info: { toolName: string; toolCallId: string; args: Record<string, unknown> }) => void',
    required: false,
  },
  onAgentToolEnd: {
    description: 'A tool call finishes or fails. Correlate with \`onAgentToolStart\` via \`toolCallId\`. \`result\` is the tool return value; \`error\` is set when the call threw.',
    type: '(info: { toolCallId: string; result?: Record<string, unknown>; error?: string }) => void',
    required: false,
  },
  onAgentMessage: {
    description: 'A message in the agent loop, with \`role\` distinguishing assistant narration from user/tool turns',
    type: '(info: { content: string; role?: "assistant" | "user" }) => void',
    required: false,
  },
  onAgentReasoning: {
    description: 'The model emitted reasoning/thinking text before acting',
    type: '(info: { thought: string }) => void',
    required: false,
  },
  onVisionStatus: {
    description: 'Whether the agent enabled image tools. Fired once before the first step, after the model\\'s input modalities were resolved. \`enabled\` is \`false\` only when the catalogue positively reports that the model cannot accept images.',
    type: '(info: { enabled: boolean; provider: string; modelId: string }) => void',
    required: false,
  },
}}
/>

<Callout type="info">
  Vision detection fails open. If the model catalogue is unreachable or reports nothing for the model, \`onVisionStatus\` fires with \`enabled: true\` and the provider returns a clear error if the model truly cannot accept images — rather than the agent silently going text-only and producing incomplete extractions.
</Callout>

Example: human status events [#example-human-status-events]

\`onStatus\` carries a coarse, strategy-independent \`phase\` so you can render localized progress without matching internal step labels or tool names.

\`\`\`js
const result = await extract({
  artifacts,
  schema,
  strategy: agent({ provider: "openai", modelId: "gpt-4o-mini" }),
  events: {
    onStatus: ({ phase, message, percent }) => {
      // phase is one of: starting | analyzing | extracting | retrying | completed | failed
      console.log(phase, message?.key, percent);
    },
  },
});
\`\`\`

When \`percent\` is \`null\`/absent, the strategy cannot report determinate progress (e.g. the agent strategy) — show an indeterminate spinner instead of a progress bar.

Example: progress bar [#example-progress-bar]

\`\`\`js
const result = await extract({
  artifacts,
  schema,
  strategy: parallel({ model, mergeModel: model, chunkSize: 8000 }),
  events: {
    onStep: ({ step, total, label }) => {
      process.stderr.write(\`[\${step}/\${total ?? "?"}] \${label ?? "working"}\\n\`);
    },
    onTokenUsage: ({ totalTokens }) => {
      process.stderr.write(\`Tokens so far: \${totalTokens}\\n\`);
    },
  },
});
\`\`\`

Example: observe retries [#example-observe-retries]

\`\`\`js
const result = await extract({
  artifacts,
  schema,
  strategy: simple({ model }),
  events: {
    onRetry: ({ attempt, maxAttempts, reason }) => {
      console.log(\`retry \${attempt}/\${maxAttempts}: \${reason ?? "validation failed"}\`);
    },
  },
});
\`\`\`

Example: agent activity feed [#example-agent-activity-feed]

\`\`\`js
const result = await extract({
  artifacts,
  schema,
  strategy: agent({ provider: "openai", modelId: "gpt-4o" }),
  events: {
    onVisionStatus: ({ enabled }) => {
      if (!enabled) console.warn("model has no vision — images will be skipped");
    },
    onAgentToolStart: ({ toolName, args }) => {
      console.log(\`→ \${toolName}\`, args);
    },
    onAgentToolEnd: ({ toolCallId, error }) => {
      if (error) console.log(\`✗ \${toolCallId}: \${error}\`);
    },
    onAgentReasoning: ({ thought }) => {
      console.log(\`… \${thought}\`);
    },
  },
});
\`\`\`

See also [#see-also]

* [extract()](/docs/sdk/extract) — main extraction function
* [Validation & Retries](/docs/explanation/validation) — validation concept
* [Strategies](/docs/explanation/strategies) — the agent strategy and its tools
* [CLI reference](/docs/cli/extract#output) — \`--format json\` emits these events as NDJSON
`,h={title:"Events & Observability",description:"Event handlers for progress tracking and observability."},d={contents:[{heading:"available-events",content:`<TypeTable
  type="{
  onStep: {
    description: 'Fired at each named phase within a strategy',
    type: '(info: { step: number; total?: number; label?: string }) => void',
    required: false,
  },
  onMessage: {
    description: 'Fired for every message in the LLM conversation',
    type: '(msg: { role: string; content: unknown }) => void',
    required: false,
  },
  onProgress: {
    description: 'Fired when a strategy can report percentage progress',
    type: '(progress: number) => void',
    required: false,
  },
  onTokenUsage: {
    description: 'Fired after each LLM call with token usage',
    type: '(usage: { inputTokens: number; outputTokens: number; totalTokens: number }) => void',
    required: false,
  },
  onRetry: {
    description: 'Fired when a step is retried after a validation or provider failure',
    type: '(info: { attempt: number; maxAttempts: number; reason?: string }) => void',
    required: false,
  },
  onStatus: {
    description: 'Human-facing status update with a coarse, strategy-independent phase',
    type: '(info: { phase: StatusPhase; message?: { key: string; params?: Record<string, string | number> }; percent?: number | null }) => void',
    required: false,
  },
}"
/>`},{heading:"agent-events",content:"These fire only from the agent strategy. Use them to render a live activity feed of what the model is doing — which tools it called, what it reasoned, and whether it can actually see images."},{heading:"agent-events",content:`<TypeTable
  type="{
  onAgentToolStart: {
    description: 'A tool call starts. \`toolName\` is the agent tool (\`read\`, \`grep\`, \`list\`, \`view_image\`, \`set_output_data\`, …), \`args\` are its arguments as sent by the model.',
    type: '(info: { toolName: string; toolCallId: string; args: Record<string, unknown> }) => void',
    required: false,
  },
  onAgentToolEnd: {
    description: 'A tool call finishes or fails. Correlate with \`onAgentToolStart\` via \`toolCallId\`. \`result\` is the tool return value; \`error\` is set when the call threw.',
    type: '(info: { toolCallId: string; result?: Record<string, unknown>; error?: string }) => void',
    required: false,
  },
  onAgentMessage: {
    description: 'A message in the agent loop, with \`role\` distinguishing assistant narration from user/tool turns',
    type: '(info: { content: string; role?: &#x22;assistant&#x22; | &#x22;user&#x22; }) => void',
    required: false,
  },
  onAgentReasoning: {
    description: 'The model emitted reasoning/thinking text before acting',
    type: '(info: { thought: string }) => void',
    required: false,
  },
  onVisionStatus: {
    description: 'Whether the agent enabled image tools. Fired once before the first step, after the model\\'s input modalities were resolved. \`enabled\` is \`false\` only when the catalogue positively reports that the model cannot accept images.',
    type: '(info: { enabled: boolean; provider: string; modelId: string }) => void',
    required: false,
  },
}"
/>`},{heading:"agent-events",content:"Vision detection fails open. If the model catalogue is unreachable or reports nothing for the model, `onVisionStatus` fires with `enabled: true` and the provider returns a clear error if the model truly cannot accept images — rather than the agent silently going text-only and producing incomplete extractions."},{heading:"example-human-status-events",content:"`onStatus` carries a coarse, strategy-independent `phase` so you can render localized progress without matching internal step labels or tool names."},{heading:"example-human-status-events",content:"When `percent` is `null`/absent, the strategy cannot report determinate progress (e.g. the agent strategy) — show an indeterminate spinner instead of a progress bar."},{heading:"see-also",content:"extract() — main extraction function"},{heading:"see-also",content:"Validation & Retries — validation concept"},{heading:"see-also",content:"Strategies — the agent strategy and its tools"},{heading:"see-also",content:"CLI reference — `--format json` emits these events as NDJSON"}],headings:[{id:"available-events",content:"Available events"},{id:"agent-events",content:"Agent events"},{id:"example-human-status-events",content:"Example: human status events"},{id:"example-progress-bar",content:"Example: progress bar"},{id:"example-observe-retries",content:"Example: observe retries"},{id:"example-agent-activity-feed",content:"Example: agent activity feed"},{id:"see-also",content:"See also"}]};const o=[{depth:2,url:"#available-events",title:e.jsx(e.Fragment,{children:"Available events"})},{depth:2,url:"#agent-events",title:e.jsx(e.Fragment,{children:"Agent events"})},{depth:2,url:"#example-human-status-events",title:e.jsx(e.Fragment,{children:"Example: human status events"})},{depth:2,url:"#example-progress-bar",title:e.jsx(e.Fragment,{children:"Example: progress bar"})},{depth:2,url:"#example-observe-retries",title:e.jsx(e.Fragment,{children:"Example: observe retries"})},{depth:2,url:"#example-agent-activity-feed",title:e.jsx(e.Fragment,{children:"Example: agent activity feed"})},{depth:2,url:"#see-also",title:e.jsx(e.Fragment,{children:"See also"})}];function t(s){const i={a:"a",code:"code",h2:"h2",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h2,{id:"available-events",children:"Available events"}),`
`,e.jsx(n,{type:{onStep:{description:"Fired at each named phase within a strategy",type:"(info: { step: number; total?: number; label?: string }) => void",required:!1},onMessage:{description:"Fired for every message in the LLM conversation",type:"(msg: { role: string; content: unknown }) => void",required:!1},onProgress:{description:"Fired when a strategy can report percentage progress",type:"(progress: number) => void",required:!1},onTokenUsage:{description:"Fired after each LLM call with token usage",type:"(usage: { inputTokens: number; outputTokens: number; totalTokens: number }) => void",required:!1},onRetry:{description:"Fired when a step is retried after a validation or provider failure",type:"(info: { attempt: number; maxAttempts: number; reason?: string }) => void",required:!1},onStatus:{description:"Human-facing status update with a coarse, strategy-independent phase",type:"(info: { phase: StatusPhase; message?: { key: string; params?: Record<string, string | number> }; percent?: number | null }) => void",required:!1}}}),`
`,e.jsx(i.h2,{id:"agent-events",children:"Agent events"}),`
`,e.jsx(i.p,{children:"These fire only from the agent strategy. Use them to render a live activity feed of what the model is doing — which tools it called, what it reasoned, and whether it can actually see images."}),`
`,e.jsx(n,{type:{onAgentToolStart:{description:"A tool call starts. `toolName` is the agent tool (`read`, `grep`, `list`, `view_image`, `set_output_data`, …), `args` are its arguments as sent by the model.",type:"(info: { toolName: string; toolCallId: string; args: Record<string, unknown> }) => void",required:!1},onAgentToolEnd:{description:"A tool call finishes or fails. Correlate with `onAgentToolStart` via `toolCallId`. `result` is the tool return value; `error` is set when the call threw.",type:"(info: { toolCallId: string; result?: Record<string, unknown>; error?: string }) => void",required:!1},onAgentMessage:{description:"A message in the agent loop, with `role` distinguishing assistant narration from user/tool turns",type:'(info: { content: string; role?: "assistant" | "user" }) => void',required:!1},onAgentReasoning:{description:"The model emitted reasoning/thinking text before acting",type:"(info: { thought: string }) => void",required:!1},onVisionStatus:{description:"Whether the agent enabled image tools. Fired once before the first step, after the model's input modalities were resolved. `enabled` is `false` only when the catalogue positively reports that the model cannot accept images.",type:"(info: { enabled: boolean; provider: string; modelId: string }) => void",required:!1}}}),`
`,e.jsx(a,{type:"info",children:e.jsxs(i.p,{children:["Vision detection fails open. If the model catalogue is unreachable or reports nothing for the model, ",e.jsx(i.code,{children:"onVisionStatus"})," fires with ",e.jsx(i.code,{children:"enabled: true"})," and the provider returns a clear error if the model truly cannot accept images — rather than the agent silently going text-only and producing incomplete extractions."]})}),`
`,e.jsx(i.h2,{id:"example-human-status-events",children:"Example: human status events"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.code,{children:"onStatus"})," carries a coarse, strategy-independent ",e.jsx(i.code,{children:"phase"})," so you can render localized progress without matching internal step labels or tool names."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"agent"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ provider: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", modelId: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o-mini"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  events: {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onStatus"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"phase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"message"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"percent"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // phase is one of: starting | analyzing | extracting | retrying | completed | failed"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(phase, message?.key, percent);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsxs(i.p,{children:["When ",e.jsx(i.code,{children:"percent"})," is ",e.jsx(i.code,{children:"null"}),"/absent, the strategy cannot report determinate progress (e.g. the agent strategy) — show an indeterminate spinner instead of a progress bar."]}),`
`,e.jsx(i.h2,{id:"example-progress-bar",children:"Example: progress bar"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"parallel"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ model, mergeModel: model, chunkSize: "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"8000"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  events: {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onStep"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"step"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"total"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"label"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      process.stderr."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"write"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`[${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"step"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"total"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ??"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "?"}] ${'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"label"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ??"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "working"}'}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onTokenUsage"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"totalTokens"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      process.stderr."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"write"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`Tokens so far: ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"totalTokens"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"\\n"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"example-observe-retries",children:"Example: observe retries"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"simple"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ model }),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  events: {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onRetry"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"attempt"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"maxAttempts"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"reason"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`retry ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"attempt"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}/${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"maxAttempts"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}: ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"reason"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ??"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "validation failed"}`'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"example-agent-activity-feed",children:"Example: agent activity feed"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"const"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" result"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" await"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" extract"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  artifacts,"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  schema,"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  strategy: "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"agent"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"({ provider: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"openai"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", modelId: "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"gpt-4o"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }),"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  events: {"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onVisionStatus"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"enabled"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"enabled) console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"warn"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"model has no vision — images will be skipped"'}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onAgentToolStart"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"toolName"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"args"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`→ ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"toolName"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", args);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onAgentToolEnd"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"toolCallId"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"error"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      if"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (error) console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`✗ ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"toolCallId"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}: ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"error"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    onAgentReasoning"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ({ "}),e.jsx(i.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"thought"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"=>"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      console."}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"log"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"`… ${"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"thought"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"}`"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  },"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"});"})})]})})}),`
`,e.jsx(i.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/sdk/extract",children:"extract()"})," — main extraction function"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/validation",children:"Validation & Retries"})," — validation concept"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/explanation/strategies",children:"Strategies"})," — the agent strategy and its tools"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.a,{href:"/docs/cli/extract#output",children:"CLI reference"})," — ",e.jsx(i.code,{children:"--format json"})," emits these events as NDJSON"]}),`
`]})]})}function k(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(t,{...s})}):t(s)}export{r as _markdown,k as default,h as frontmatter,d as structuredData,o as toc};
