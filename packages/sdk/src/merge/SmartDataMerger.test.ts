import { test, expect } from "bun:test";
import { SmartDataMerger } from "./SmartDataMerger";

test("SmartDataMerger concatenates arrays and preserves scalars", () => {
  const schema = {
    type: "object",
    properties: {
      items: { type: "array" },
      title: { type: "string" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge(
    { items: [1], title: "A" },
    { items: [2], title: "" }
  );

  expect(result.items).toEqual([1, 2]);
  expect(result.title).toBe("A");
});

test("SmartDataMerger merges nested objects", () => {
  const schema = {
    type: "object",
    properties: {
      user: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
      },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge(
    { user: { name: "Alice" } },
    { user: { email: "alice@example.com" } }
  );

  expect(result.user).toEqual({ name: "Alice", email: "alice@example.com" });
});

test("SmartDataMerger prefers new scalar values when not empty", () => {
  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      count: { type: "number" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge(
    { title: "Old", count: 1 },
    { title: "New", count: 2 }
  );

  expect(result.title).toBe("New");
  expect(result.count).toBe(2);
});

test("SmartDataMerger preserves old value when new is null", () => {
  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({ title: "Old" }, { title: null });

  expect(result.title).toBe("Old");
});

test("SmartDataMerger preserves old value when new is undefined", () => {
  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({ title: "Old" }, {});

  expect(result.title).toBe("Old");
});

test("SmartDataMerger handles missing current value for arrays", () => {
  const schema = {
    type: "object",
    properties: {
      items: { type: "array" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({}, { items: [1, 2] });

  expect(result.items).toEqual([1, 2]);
});

test("SmartDataMerger handles missing new value for arrays", () => {
  const schema = {
    type: "object",
    properties: {
      items: { type: "array" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({ items: [1, 2] }, {});

  expect(result.items).toEqual([1, 2]);
});

test("SmartDataMerger handles non-array values for array schema", () => {
  const schema = {
    type: "object",
    properties: {
      items: { type: "array" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({ items: "not-an-array" }, { items: [1] });

  expect(result.items).toEqual([1]);
});

test("SmartDataMerger handles non-object values for object schema", () => {
  const schema = {
    type: "object",
    properties: {
      user: { type: "object", properties: {} },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({ user: "not-an-object" }, { user: { name: "Alice" } });

  expect(result.user).toEqual({ name: "Alice" });
});

test("SmartDataMerger preserves properties not in schema", () => {
  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
    },
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge(
    { title: "A", extra: "preserved" },
    { title: "B" }
  );

  expect(result.title).toBe("B");
  expect(result.extra).toBe("preserved");
});

test("SmartDataMerger handles empty schema properties", () => {
  const schema = {
    type: "object",
    properties: {},
  };

  const merger = new SmartDataMerger(schema);
  const result = merger.merge({ title: "A" }, { title: "B" });

  expect(result.title).toBe("A");
});
