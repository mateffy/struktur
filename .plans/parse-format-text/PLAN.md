# Parse --format text Implementation Plan

> **Status:** DRAFT
> **Plan:** `./.plans/parse-format-text/PLAN.md`
> **Last updated:** 2025-07-17

---

## ⚠️ Instructions for the implementing agent

**READ THIS SECTION BEFORE TOUCHING ANY CODE.**

You are an executor. Your job is to implement this plan exactly as written.
This plan was written with full context from a prior research and design session.
You do not have that context. The plan is your complete specification.

**Rules you must follow without exception:**

1. **Do not deviate from this plan.** Do not simplify steps, skip phases, combine
   tasks, or substitute approaches — even if a different approach seems easier or
   more elegant. The decisions here were made deliberately. Respect them.

2. **Do not make decisions not explicitly covered by this plan.** If you reach a
   point where the plan is ambiguous or where you feel you need to make a choice
   the plan does not make for you, **stop and ask the user** before proceeding.
   Do not guess. Do not pick the path of least resistance. Do not assume.

3. **Do not change the plan.** If you believe a plan decision is wrong or
   suboptimal, stop and tell the user why. Do not silently implement something
   different.

4. **Work phase by phase.** Complete one phase fully before starting the next.
   Do not jump ahead.

5. **Update the Progress section** at the bottom of this file as you work:
   - Mark phase checkboxes `[x]` when a phase is complete.
   - Mark task checkboxes `[x]` as each task is done.
   - After each phase, write a brief note under "Session log" with what was
     done and what comes next. This allows a new agent to resume from exactly
     where you left off if the session is interrupted.

6. **If your context window is running low**, finish the current task cleanly,
   update the Progress section with exactly where you stopped and what the next
   step is, then tell the user you need a fresh session to continue.

---

## Goal

Make `struktur parse --format text` output plain text (concatenated page contents separated by `---`). When `--images` is also passed, inline images as markdown `![](data:image/png;base64,...)` tags. JSON becomes the new default (`--format json`) since that was the actual behavior all along.

## Approach

1. **Extract** the output formatting into a pure function `formatParseOutput()` in `packages/cli/src/cli/shared.ts` so it's testable.
2. **Implement** two modes in that function:
   - `"json"` — `JSON.stringify(serialized, null, 2)` (current behavior)
   - `"text"` — iterate contents, extract `text` fields, join with `\n\n---\n\n`. When `includeImages` is true, also emit `![](data:image/png;base64,<base64>)` for each media item that has a `base64`.
3. **Wire it up** in the `parseCommand.run()` — call `formatParseOutput()` instead of always JSON.
4. **Test thoroughly** — the parse output was never tested before, which is why `--format` was broken silently.

## Tech stack & conventions

- **Bun** for testing, **TypeScript** throughout.
- The CLI is built with **citty** (`defineCommand`).
- Output goes through `writeOutput(target, data)`.
- Tests live next to source: `packages/cli/src/cli/shared.test.ts`.
- CommonMark supports data URIs in image syntax: `![alt](data:image/png;base64,...)` — confirmed via web research.

---

## Context & orientation

**Key files:**
- `packages/cli/src/cli.ts` — `parseCommand` at ~line 2243
- `packages/cli/src/cli/shared.ts` — shared utilities, where `formatParseOutput()` will live
- `packages/cli/src/cli/shared.test.ts` — where the new tests go
- `packages/sdk/src/artifacts/input.ts` — `SerializedArtifact`, `SerializedArtifactContent`, `SerializedArtifactImage` types

**Relevant types:**
- `SerializedArtifact[]` — top-level array. Each has `contents: SerializedArtifactContent[]`.
- `SerializedArtifactContent` — `{ page?: number; text?: string; media?: SerializedArtifactImage[] }`
- `SerializedArtifactImage` — `{ type: "image"; url?: string; base64?: string; ... }`

**Current bug:** `parseCommand.run()` at line 2457-2458:
```typescript
const json = JSON.stringify(serialized, null, 2);
await writeOutput(args.output, json);
```
The `format` variable is computed but never consulted for output format. The `--format` flag's default is `"text"` but the output is always JSON.

**Image MIME type:** `ArtifactImage` / `SerializedArtifactImage` don't carry an explicit MIME field. Screenshots from PDF pages are typically PNG. We default to `image/png` for the data URI. The `base64` field on `SerializedArtifactImage` is already the raw base64 string (not a Buffer — the serialize step converts `contents: Buffer` to `base64: string`).

---

## Scope

**In scope (exact paths):**
- `packages/cli/src/cli/shared.ts` — new `formatParseOutput()` function + export
- `packages/cli/src/cli/shared.test.ts` — new tests for `formatParseOutput()`
- `packages/cli/src/cli.ts` — `parseCommand` (~line 2295 for default change, ~line 2457 for usage)

**Out of scope:**
- `packages/http/**`
- `packages/sdk/**`
- `extractCommand` or any other CLI command
- MIME type auto-detection from base64 magic bytes (use `image/png` default)

**Forbidden actions (do not do these under any circumstances):**
- Do NOT change `writeOutput` or `loadArtifactsFromOptions`.
- Do NOT change the serialization loop that builds `serialized` from `artifacts`.
- Do NOT add new dependencies.
- Do NOT modify the `--format` flag's `valueHint` (it stays `"text|json|debug"` — but the default changes).
- Do NOT change any `extractCommand` code.

---

## Acceptance criteria

1. `struktur parse <file> --format json` → JSON output (explicit).
2. `struktur parse <file>` (no `--format`) → JSON output (new default).
3. `struktur parse <file> --format text` → plain text, pages joined by `\n\n---\n\n`, no headings.
4. `struktur parse <file> --format text --images` → text with `![](data:image/png;base64,...)` for each image on each page.
5. `struktur parse <file> --format text` on a text-only file → just the text content, no separators.
6. `struktur parse <file> --format text` on an image-only artifact → empty output (no text to show).
7. `bun test` passes all new + existing tests.
8. `bun run --filter @struktur/cli build` succeeds.

---

## Phases & tasks

### Phase 1: Add `formatParseOutput()` to shared.ts

Extract the formatting logic into a pure, testable function before touching the CLI command.

#### Task 1.1: Write tests first

**Why:** Tests define the behavior before implementation. Catches regressions.

**Files:**
- Modify: `packages/cli/src/cli/shared.test.ts`

**Steps:**

- [ ] **Step 1:** Add the import at the top of `shared.test.ts`:
      ```typescript
      import { formatParseOutput } from "./shared";
      import type { SerializedArtifact } from "@struktur/sdk";
      ```

- [ ] **Step 2:** Add a `describe("formatParseOutput")` block with these tests. Place it at the end of the file (before the last closing brace if there's a describe wrapper, otherwise just append).

      **Test: `formatParseOutput("json")` returns JSON string**
      ```typescript
      test('formatParseOutput("json") returns prettified JSON', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "text",
            contents: [{ text: "hello world" }],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "json" });
        const parsed = JSON.parse(result);
        expect(parsed).toEqual(artifacts);
        // Verify it's pretty-printed (contains newlines)
        expect(result).toContain("\n");
      });
      ```

      **Test: `formatParseOutput("text")` extracts text from single content**
      ```typescript
      test('formatParseOutput("text") returns text for single content entry', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "text",
            contents: [{ text: "hello world" }],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text" });
        expect(result).toBe("hello world");
      });
      ```

      **Test: `formatParseOutput("text")` joins multiple contents with `---` separators**
      ```typescript
      test('formatParseOutput("text") joins multiple content entries with ---', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "pdf",
            contents: [
              { page: 1, text: "first page" },
              { page: 2, text: "second page" },
            ],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text" });
        expect(result).toBe("first page\n\n---\n\nsecond page");
      });
      ```

      **Test: `formatParseOutput("text")` skips content entries without text**
      ```typescript
      test('formatParseOutput("text") skips content entries without text', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "pdf",
            contents: [
              { text: "has text" },
              { media: [{ type: "image" as const, base64: "aaaa" }] },
              { text: "more text" },
            ],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text" });
        expect(result).toBe("has text\n\n---\n\nmore text");
      });
      ```

      **Test: `formatParseOutput("text")` handles multiple artifacts**
      ```typescript
      test('formatParseOutput("text") handles multiple artifacts', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "text",
            contents: [{ text: "first doc" }],
          },
          {
            id: "a2",
            type: "text",
            contents: [{ text: "second doc" }],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text" });
        expect(result).toBe("first doc\n\n---\n\nsecond doc");
      });
      ```

      **Test: `formatParseOutput("text")` with `includeImages: true` adds markdown images**
      ```typescript
      test('formatParseOutput("text") with includeImages adds markdown image tags', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "pdf",
            contents: [
              {
                page: 1,
                text: "some text",
                media: [
                  { type: "image" as const, base64: "abc123" },
                  { type: "image" as const, base64: "def456" },
                ],
              },
            ],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text", includeImages: true });
        const expected =
          "some text\n\n" +
          "![](data:image/png;base64,abc123)\n\n" +
          "![](data:image/png;base64,def456)";
        expect(result).toBe(expected);
      });
      ```

      **Test: `formatParseOutput("text")` with `includeImages: false` (default) ignores images**
      ```typescript
      test('formatParseOutput("text") with includeImages: false ignores images', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "pdf",
            contents: [
              {
                page: 1,
                text: "some text",
                media: [{ type: "image" as const, base64: "abc123" }],
              },
            ],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text", includeImages: false });
        expect(result).toBe("some text");
      });
      ```

      **Test: `formatParseOutput("text")` skips image entries without base64**
      ```typescript
      test('formatParseOutput("text") skips image entries without base64', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "pdf",
            contents: [
              {
                text: "some text",
                media: [
                  { type: "image" as const, url: "https://example.com/img.png" },
                  { type: "image" as const, base64: "abc123" },
                ],
              },
            ],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text", includeImages: true });
        expect(result).toBe("some text\n\n![](data:image/png;base64,abc123)");
      });
      ```

      **Test: `formatParseOutput("text")` on empty artifacts array**
      ```typescript
      test('formatParseOutput("text") on empty artifacts returns empty string', () => {
        const result = formatParseOutput([], { format: "text" });
        expect(result).toBe("");
      });
      ```

      **Test: `formatParseOutput("text")` on artifacts with no text at all**
      ```typescript
      test('formatParseOutput("text") on artifacts with no text returns empty string', () => {
        const artifacts: SerializedArtifact[] = [
          {
            id: "a1",
            type: "image",
            contents: [{ media: [{ type: "image" as const, base64: "abc" }] }],
          },
        ];
        const result = formatParseOutput(artifacts, { format: "text" });
        expect(result).toBe("");
      });
      ```

- [ ] **Step 3:** Run the tests — they should all fail because `formatParseOutput` doesn't exist yet.
      ```bash
      bun test packages/cli/src/cli/shared.test.ts
      ```
      Expected: 10+ failures — `formatParseOutput is not exported` / `is not a function`.

#### Task 1.2: Implement `formatParseOutput()`

**Why:** Pure function for the tests to call, extracted from the command for testability.

**Files:**
- Modify: `packages/cli/src/cli/shared.ts` (append at end of file)

**Steps:**

- [ ] **Step 1:** Add the import and function at the end of `shared.ts`:
      ```typescript
      import type { SerializedArtifact } from "@struktur/sdk";

      export type FormatParseOutputOptions = {
        format: "json" | "text";
        /** When true, include inline markdown images for media with base64 data. Default false. */
        includeImages?: boolean;
      };

      export const formatParseOutput = (
        artifacts: SerializedArtifact[],
        options: FormatParseOutputOptions,
      ): string => {
        if (options.format === "json") {
          return JSON.stringify(artifacts, null, 2);
        }

        // Text mode: concatenate content text with --- separators
        const parts: string[] = [];

        for (const artifact of artifacts) {
          for (const content of artifact.contents) {
            if (content.text) {
              parts.push(content.text);
            }
            if (options.includeImages && content.media) {
              for (const img of content.media) {
                if (img.base64) {
                  parts.push(`![](data:image/png;base64,${img.base64})`);
                }
              }
            }
          }
        }

        return parts.join("\n\n---\n\n");
      };
      ```

- [ ] **Step 2:** Run the tests — all 10 new tests should pass.
      ```bash
      bun test packages/cli/src/cli/shared.test.ts
      ```
      Expected: all tests pass.

---

### Phase 2: Wire into parse command

#### Task 2.1: Update `parseCommand` to use `formatParseOutput`

**Why:** This closes the bug — the `--format` flag now actually controls output.

**Files:**
- Modify: `packages/cli/src/cli.ts` (~line 2295, ~line 2457)

**Steps:**

- [ ] **Step 1:** Import `formatParseOutput` at the top of the file. Find the existing import from `./cli/shared` (it's around line 75-85) and add `formatParseOutput` to it:
      ```typescript
      import {
        usage,
        parseArgs,
        readStdinText,
        readStdinBinary,
        loadArtifactsFromOptions,
        loadSchema,
        resolveDefaultModelSpec,
        resolveExplicitModelSpec,
        stdinConsumed,
        UserError,
        formatParseOutput,
      } from "./cli/shared";
      ```
      (If `formatParseOutput` isn't in the existing import, add it. If the import is a wildcard or destructured from a different path, adjust accordingly — find the exact import block first.)

- [ ] **Step 2:** Change the `--format` flag default from `"text"` to `"json"` and update the description (line ~2295):
      Find:
      ```typescript
      format: {
        type: "string",
        description:
          "Output format mode: text (default), json (NDJSON events on stderr), debug (verbose debug NDJSON)",
        default: "text",
        valueHint: "text|json|debug",
      },
      ```
      Replace with:
      ```typescript
      format: {
        type: "string",
        description:
          "Output format mode: json (default), text (plain text from pages), debug (verbose debug NDJSON)",
        default: "json",
        valueHint: "json|text|debug",
      },
      ```

- [ ] **Step 3:** Update the mutual-exclusivity guard to check against the new default (line ~2306):
      Find:
      ```typescript
      if (args.debug === true && args.format !== "text") {
      ```
      Replace with:
      ```typescript
      if (args.debug === true && args.format !== "json") {
      ```

- [ ] **Step 4:** Replace the final output block at the end of `parseCommand.run()` (lines ~2457-2458):
      Find:
      ```typescript
      const json = JSON.stringify(serialized, null, 2);
      await writeOutput(args.output, json);
      ```
      Replace with:
      ```typescript
      const output = formatParseOutput(serialized, {
        format: format as "json" | "text",
        includeImages: args.images === true,
      });
      await writeOutput(args.output, output);
      ```

- [ ] **Step 5:** Run the full test suite:
      ```bash
      bun test
      ```
      Expected: all tests pass (existing + new).

- [ ] **Step 6:** Run the build to confirm TypeScript compiles:
      ```bash
      cd packages/cli && bun run build
      ```
      Expected: builds without errors.

---

### Phase 3: Manual smoke tests

#### Task 3.1: Verify CLI behavior end-to-end

**Why:** The tests cover the pure function, but we need to confirm the CLI integration works.

**Steps:**

- [ ] **Step 1:** Text format on a text file:
      ```bash
      echo "hello world" > /tmp/test-parse.txt
      bun run packages/cli/src/cli.ts parse /tmp/test-parse.txt --format text
      ```
      Expected: outputs `hello world` (plain text, no JSON wrapper).

- [ ] **Step 2:** Default format is JSON:
      ```bash
      bun run packages/cli/src/cli.ts parse /tmp/test-parse.txt
      ```
      Expected: JSON output with artifact wrapper.

- [ ] **Step 3:** Explicit JSON format:
      ```bash
      bun run packages/cli/src/cli.ts parse /tmp/test-parse.txt --format json
      ```
      Expected: same JSON output as step 2.

- [ ] **Step 4:** --debug and --format are mutually exclusive:
      ```bash
      bun run packages/cli/src/cli.ts parse /tmp/test-parse.txt --format text --debug
      ```
      Expected: error about mutual exclusivity.

- [ ] **Step 5:** Text format with multi-line text:
      ```bash
      printf "line1\nline2\nline3" > /tmp/test-multi.txt
      bun run packages/cli/src/cli.ts parse /tmp/test-multi.txt --format text
      ```
      Expected: outputs `line1\nline2\nline3` (preserved newlines).

---

## Validation

```bash
# Run all tests
bun test
# Expected: all green, ≥ 10 new tests for formatParseOutput

# Build check
cd packages/cli && bun run build
# Expected: builds without errors

# Manual CLI checks (see Phase 3)
```

---

## Risks & rollback

- **Risk:** Someone has a script that runs `struktur parse --format text` explicitly (since it was the documented default). **Mitigation:** `--format text` never actually worked — it always output JSON. So there are no real scripts relying on it. Now it will actually produce text.
- **Risk:** Someone relies on `struktur parse` (no `--format`) returning JSON. **Mitigation:** The new default is `"json"`, so this behavior is preserved.
- **Rollback:** Revert the three changes in `cli.ts` and remove the `formatParseOutput` export. Trivial.

---

## Open questions

*(none)*

---

## Progress

**This section is maintained by the implementing agent. Update it continuously.**

### Phase completion

- [x] Phase 1: Add `formatParseOutput()` to shared.ts
- [x] Phase 2: Wire into parse command
- [x] Phase 3: Manual smoke tests
- [x] Validation complete
- [x] Plan marked DONE

### Session log

**2025-07-17 — Implementation complete**

All three phases done:
1. Added 10 tests for `formatParseOutput()` in `shared.test.ts`, then implemented the function in `shared.ts` with `SerializedArtifact` type import.
2. Wired into `parseCommand.run()`: added `formatParseOutput` import, changed `--format` default from `"text"` to `"json"`, updated the mutual-exclusivity guard, replaced both output sites (artifact JSON early return + final serialized output) to use `formatParseOutput`.
3. Smoke tested: `--format json` → JSON, `--format text` → plain text, default (no `--format`) → JSON, `--debug --format text` → mutual exclusivity error.

All 473 tests pass, build succeeds.