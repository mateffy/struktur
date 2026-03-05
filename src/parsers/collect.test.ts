import { test, expect } from "bun:test";
import { collectStream } from "./collect";

test("collectStream collects single chunk", async () => {
  const data = Buffer.from("hello world");
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });

  const result = await collectStream(stream);
  expect(result.toString()).toBe("hello world");
});

test("collectStream collects multiple chunks", async () => {
  const chunks = [Buffer.from("foo"), Buffer.from("bar"), Buffer.from("baz")];
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  const result = await collectStream(stream);
  expect(result.toString()).toBe("foobarbaz");
});

test("collectStream returns Buffer", async () => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]));
      controller.close();
    },
  });

  const result = await collectStream(stream);
  expect(Buffer.isBuffer(result)).toBe(true);
  expect(result[0]).toBe(1);
  expect(result[1]).toBe(2);
  expect(result[2]).toBe(3);
});

test("collectStream handles empty stream", async () => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.close();
    },
  });

  const result = await collectStream(stream);
  expect(result.length).toBe(0);
});
