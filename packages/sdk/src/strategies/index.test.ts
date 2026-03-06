import { test, expect } from "bun:test";
import * as strategies from "./index";

test("strategies index re-exports constructors and helpers", () => {
  expect(typeof strategies.SimpleStrategy).toBe("function");
  expect(typeof strategies.ParallelStrategy).toBe("function");
  expect(typeof strategies.SequentialStrategy).toBe("function");
  expect(typeof strategies.ParallelAutoMergeStrategy).toBe("function");
  expect(typeof strategies.SequentialAutoMergeStrategy).toBe("function");
  expect(typeof strategies.DoublePassStrategy).toBe("function");
  expect(typeof strategies.DoublePassAutoMergeStrategy).toBe("function");

  expect(typeof strategies.simple).toBe("function");
  expect(typeof strategies.parallel).toBe("function");
  expect(typeof strategies.sequential).toBe("function");
  expect(typeof strategies.parallelAutoMerge).toBe("function");
  expect(typeof strategies.sequentialAutoMerge).toBe("function");
  expect(typeof strategies.doublePass).toBe("function");
  expect(typeof strategies.doublePassAutoMerge).toBe("function");
});
