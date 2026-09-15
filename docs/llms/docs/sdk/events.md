

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
    description: 'A tool call starts. `toolName` is the agent tool (`read`, `grep`, `list`, `view_image`, `set_output_data`, …), `args` are its arguments as sent by the model.',
    type: '(info: { toolName: string; toolCallId: string; args: Record<string, unknown> }) => void',
    required: false,
  },
  onAgentToolEnd: {
    description: 'A tool call finishes or fails. Correlate with `onAgentToolStart` via `toolCallId`. `result` is the tool return value; `error` is set when the call threw.',
    type: '(info: { toolCallId: string; result?: Record<string, unknown>; error?: string }) => void',
    required: false,
  },
  onAgentMessage: {
    description: 'A message in the agent loop, with `role` distinguishing assistant narration from user/tool turns',
    type: '(info: { content: string; role?: "assistant" | "user" }) => void',
    required: false,
  },
  onAgentReasoning: {
    description: 'The model emitted reasoning/thinking text before acting',
    type: '(info: { thought: string }) => void',
    required: false,
  },
  onVisionStatus: {
    description: 'Whether the agent enabled image tools. Fired once before the first step, after the model\'s input modalities were resolved. `enabled` is `false` only when the catalogue positively reports that the model cannot accept images.',
    type: '(info: { enabled: boolean; provider: string; modelId: string }) => void',
    required: false,
  },
}}
/>

<Callout type="info">
  Vision detection fails open. If the model catalogue is unreachable or reports nothing for the model, `onVisionStatus` fires with `enabled: true` and the provider returns a clear error if the model truly cannot accept images — rather than the agent silently going text-only and producing incomplete extractions.
</Callout>

Example: human status events [#example-human-status-events]

`onStatus` carries a coarse, strategy-independent `phase` so you can render localized progress without matching internal step labels or tool names.

```js
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
```

When `percent` is `null`/absent, the strategy cannot report determinate progress (e.g. the agent strategy) — show an indeterminate spinner instead of a progress bar.

Example: progress bar [#example-progress-bar]

```js
const result = await extract({
  artifacts,
  schema,
  strategy: parallel({ model, mergeModel: model, chunkSize: 8000 }),
  events: {
    onStep: ({ step, total, label }) => {
      process.stderr.write(`[${step}/${total ?? "?"}] ${label ?? "working"}\n`);
    },
    onTokenUsage: ({ totalTokens }) => {
      process.stderr.write(`Tokens so far: ${totalTokens}\n`);
    },
  },
});
```

Example: observe retries [#example-observe-retries]

```js
const result = await extract({
  artifacts,
  schema,
  strategy: simple({ model }),
  events: {
    onRetry: ({ attempt, maxAttempts, reason }) => {
      console.log(`retry ${attempt}/${maxAttempts}: ${reason ?? "validation failed"}`);
    },
  },
});
```

Example: agent activity feed [#example-agent-activity-feed]

```js
const result = await extract({
  artifacts,
  schema,
  strategy: agent({ provider: "openai", modelId: "gpt-4o" }),
  events: {
    onVisionStatus: ({ enabled }) => {
      if (!enabled) console.warn("model has no vision — images will be skipped");
    },
    onAgentToolStart: ({ toolName, args }) => {
      console.log(`→ ${toolName}`, args);
    },
    onAgentToolEnd: ({ toolCallId, error }) => {
      if (error) console.log(`✗ ${toolCallId}: ${error}`);
    },
    onAgentReasoning: ({ thought }) => {
      console.log(`… ${thought}`);
    },
  },
});
```

See also [#see-also]

* [extract()](/docs/sdk/extract) — main extraction function
* [Validation & Retries](/docs/explanation/validation) — validation concept
* [Strategies](/docs/explanation/strategies) — the agent strategy and its tools
* [CLI reference](/docs/cli/extract#output) — `--format json` emits these events as NDJSON
