import { test, expect } from "bun:test";
import * as api from "./index";

test("index re-exports main API", () => {
  expect(typeof api.extract).toBe("function");
  expect(typeof api.urlToArtifact).toBe("function");
  expect(typeof api.fileToArtifact).toBe("function");
  expect(typeof api.registerArtifactProvider).toBe("function");
  expect(typeof api.clearArtifactProviders).toBe("function");
  expect(typeof api.registerArtifactInputParser).toBe("function");
  expect(typeof api.clearArtifactInputParsers).toBe("function");
  expect(typeof api.validateSerializedArtifacts).toBe("function");
  expect(typeof api.parseSerializedArtifacts).toBe("function");
  expect(typeof api.hydrateSerializedArtifacts).toBe("function");
  expect(typeof api.parseInputToArtifacts).toBe("function");
  expect(typeof api.splitTextIntoContents).toBe("function");

  expect(typeof api.simple).toBe("function");
  expect(typeof api.parallel).toBe("function");
  expect(typeof api.sequential).toBe("function");
});
