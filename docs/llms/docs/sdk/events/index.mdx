

Available events [#available-events]

| Event          | Description                                          |
| -------------- | ---------------------------------------------------- |
| `onStep`       | Fired at each named phase within a strategy          |
| `onMessage`    | Fired for every message in the LLM conversation      |
| `onProgress`   | Fired when a strategy can report percentage progress |
| `onTokenUsage` | Fired after each LLM call with token usage           |

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
    onMessage: ({ role, content }) => {
      if (role === "user" && String(content).includes("validation-errors")) {
        console.log("Retry triggered");
      }
    },
  },
});
```

See also [#see-also]

* [extract()](/docs/sdk/extract) — main extraction function
* [Validation & Retries](/docs/explanation/validation) — validation concept
