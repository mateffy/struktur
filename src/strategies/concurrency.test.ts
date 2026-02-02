import { test, expect } from "bun:test";
import { runConcurrently } from "./concurrency";

test("runConcurrently runs tasks in batches", async () => {
  const started: number[] = [];
  const tasks = [1, 2, 3, 4, 5].map((value) => async () => {
    started.push(value);
    await new Promise((resolve) => setTimeout(resolve, 5));
    return value;
  });

  const results = await runConcurrently(tasks, 2);

  expect(results).toEqual([1, 2, 3, 4, 5]);
  expect(started).toEqual([1, 2, 3, 4, 5]);
});
