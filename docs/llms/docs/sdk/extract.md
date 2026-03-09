

import { TypeTable } from 'fumadocs-ui/components/type-table';
import { Callout } from 'fumadocs-ui/components/callout';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';

Usage [#usage]

```js
import { extract, simple } from "@struktur/sdk";
import { openai } from "@ai-sdk/openai";

const result = await extract({
  artifacts,
  schema,
  strategy: simple({ model: openai("gpt-4o-mini") }),
});

console.log(result.data);
console.log(result.usage.totalTokens);
```

Options [#options]

<TypeTable
  type={{
  artifacts: {
    description: 'Array of artifacts to extract from',
    type: 'Artifact[]',
    required: true,
  },
  schema: {
    description: 'JSON Schema for output validation (one of schema or fields required)',
    type: 'AnyJSONSchema',
    required: false,
  },
  fields: {
    description: 'Fields shorthand — comma-separated field definitions',
    type: 'string',
    required: false,
  },
  strategy: {
    description: 'A strategy instance',
    type: 'Strategy',
    required: true,
  },
  events: {
    description: 'Event handlers for progress tracking',
    type: 'Events',
    required: false,
  },
}}
/>

<Callout type="warn">
  Exactly one of `schema` or `fields` must be provided. Passing both, or neither, throws immediately.
</Callout>

Result [#result]

<TypeTable
  type={{
  data: {
    description: 'Validated output matching your schema',
    type: 'T',
    required: true,
  },
  usage: {
    description: 'Token counts: inputTokens, outputTokens, totalTokens',
    type: 'Usage',
    required: true,
  },
  error: {
    description: 'Set if extraction encountered a non-fatal error',
    type: 'Error | undefined',
    required: false,
  },
}}
/>

Using fields instead of schema [#using-fields-instead-of-schema]

For quick extractions where you don't need full JSON Schema control, pass a `fields` string:

```ts
const result = await extract({
  artifacts,
  fields: "title, author, year:integer, genre:enum{fiction|nonfiction|reference}",
  strategy: simple({ model: openai("gpt-4o-mini") }),
});
```

`fields` supports scalar types (`string`, `number`/`float`, `boolean`/`bool`, `integer`, `int`), enum sets (`status:enum{draft|live}`), and arrays (`tags:array{string}`). See the [Fields Shorthand](/docs/cli/fields) reference for the full syntax.

See also [#see-also]

* [Fields Shorthand](/docs/cli/fields) — quick schema syntax reference
* [Installation & Setup](/docs/cli/installation) — getting started
* [Extraction Strategies](/docs/explanation/strategies) — creating strategies
* [Events & Observability](/docs/sdk/events) — progress tracking
