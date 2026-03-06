import { test, expect, beforeEach, afterEach } from "bun:test";
import { createDebugLogger } from "./logger";

let stderrOutput: string[];
const originalStderrWrite = process.stderr.write;

beforeEach(() => {
  stderrOutput = [];
  process.stderr.write = (chunk: unknown) => {
    if (typeof chunk === "string") {
      stderrOutput.push(chunk);
    }
    return true;
  };
});

afterEach(() => {
  process.stderr.write = originalStderrWrite;
});

test("createDebugLogger with enabled=false is a no-op", () => {
  const logger = createDebugLogger(false);
  logger.cliInit({ args: { test: true } });
  expect(stderrOutput.length).toBe(0);
});

test("createDebugLogger with enabled=true logs to stderr", () => {
  const logger = createDebugLogger(true);
  logger.cliInit({ args: { test: true } });
  expect(stderrOutput.length).toBe(1);
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("cli_init");
  expect(parsed.args).toEqual({ test: true });
  expect(parsed.timestamp).toBeDefined();
});

test("cliInit logs correct type", () => {
  const logger = createDebugLogger(true);
  logger.cliInit({ args: { strategy: "simple" } });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("cli_init");
});

test("schemaLoaded logs source and size", () => {
  const logger = createDebugLogger(true);
  logger.schemaLoaded({ source: "file.json", schemaSize: 100 });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("schema_loaded");
  expect(parsed.source).toBe("file.json");
  expect(parsed.schemaSize).toBe(100);
});

test("artifactsLoaded logs artifact details", () => {
  const logger = createDebugLogger(true);
  logger.artifactsLoaded({
    count: 2,
    artifacts: [
      { id: "a1", type: "text", contentCount: 1, tokens: 10 },
      { id: "a2", type: "pdf", contentCount: 3 },
    ],
    totalTokens: 1010,
    totalImages: 2,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("artifacts_loaded");
  expect(parsed.count).toBe(2);
  expect(parsed.totalTokens).toBe(1010);
  expect(parsed.totalImages).toBe(2);
});

test("chunkingStart logs chunking parameters", () => {
  const logger = createDebugLogger(true);
  logger.chunkingStart({
    artifactId: "a1",
    totalTokens: 100,
    maxTokens: 50,
    maxImages: 5,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("chunking_start");
  expect(parsed.artifactId).toBe("a1");
  expect(parsed.maxTokens).toBe(50);
});

test("llmCallStart logs call details", () => {
  const logger = createDebugLogger(true);
  logger.llmCallStart({
    callId: "call-1",
    model: "gpt-4",
    schemaName: "extract",
    systemLength: 100,
    userLength: 200,
    artifactCount: 3,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("llm_call_start");
  expect(parsed.callId).toBe("call-1");
  expect(parsed.artifactCount).toBe(3);
});

test("llmCallComplete logs success with duration", () => {
  const logger = createDebugLogger(true);
  logger.llmCallComplete({
    callId: "call-1",
    success: true,
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150,
    durationMs: 1234,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("llm_call_complete");
  expect(parsed.success).toBe(true);
  expect(parsed.durationMs).toBe(1234);
});

test("llmCallComplete logs failure with error", () => {
  const logger = createDebugLogger(true);
  logger.llmCallComplete({
    callId: "call-1",
    success: false,
    inputTokens: 100,
    outputTokens: 0,
    totalTokens: 100,
    error: "API error",
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.success).toBe(false);
  expect(parsed.error).toBe("API error");
});

test("retry logs retry attempt", () => {
  const logger = createDebugLogger(true);
  logger.retry({
    callId: "call-1",
    attempt: 2,
    maxAttempts: 3,
    reason: "schema_validation_failed",
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("retry");
  expect(parsed.attempt).toBe(2);
  expect(parsed.reason).toBe("schema_validation_failed");
});

test("validationStart logs validation attempt", () => {
  const logger = createDebugLogger(true);
  logger.validationStart({
    callId: "call-1",
    attempt: 1,
    maxAttempts: 3,
    strict: false,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("validation_start");
  expect(parsed.strict).toBe(false);
});

test("validationSuccess logs successful validation", () => {
  const logger = createDebugLogger(true);
  logger.validationSuccess({ callId: "call-1", attempt: 1 });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("validation_success");
});

test("validationFailed logs validation errors", () => {
  const logger = createDebugLogger(true);
  logger.validationFailed({
    callId: "call-1",
    attempt: 1,
    errors: [{ keyword: "required", message: "missing field" }],
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("validation_failed");
  expect(parsed.errors).toBeDefined();
});

test("mergeStart logs merge operation", () => {
  const logger = createDebugLogger(true);
  logger.mergeStart({
    mergeId: "merge-1",
    inputCount: 3,
    strategy: "parallel",
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("merge_start");
  expect(parsed.inputCount).toBe(3);
});

test("mergeComplete logs merge result", () => {
  const logger = createDebugLogger(true);
  logger.mergeComplete({ mergeId: "merge-1", success: true });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("merge_complete");
  expect(parsed.success).toBe(true);
});

test("dedupeStart logs deduplication start", () => {
  const logger = createDebugLogger(true);
  logger.dedupeStart({ dedupeId: "dedupe-1", itemCount: 10 });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("dedupe_start");
  expect(parsed.itemCount).toBe(10);
});

test("dedupeComplete logs deduplication result", () => {
  const logger = createDebugLogger(true);
  logger.dedupeComplete({
    dedupeId: "dedupe-1",
    duplicatesFound: 3,
    itemsRemoved: 3,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("dedupe_complete");
  expect(parsed.duplicatesFound).toBe(3);
});

test("extractionComplete logs final result", () => {
  const logger = createDebugLogger(true);
  logger.extractionComplete({
    success: true,
    totalInputTokens: 100,
    totalOutputTokens: 50,
    totalTokens: 150,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("extraction_complete");
  expect(parsed.success).toBe(true);
});

test("smartMergeField logs field merge operation", () => {
  const logger = createDebugLogger(true);
  logger.smartMergeField({
    mergeId: "merge-1",
    field: "items",
    operation: "merge_arrays",
    leftCount: 5,
    rightCount: 3,
    resultCount: 8,
  });
  const parsed = JSON.parse(stderrOutput[0]!);
  expect(parsed.type).toBe("smart_merge_field");
  expect(parsed.operation).toBe("merge_arrays");
});
