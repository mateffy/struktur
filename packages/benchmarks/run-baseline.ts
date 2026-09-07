import { defineCase, runBenchmark, saveReport, type BenchmarkCase } from "./src/index";
import { textArtifact, generateKeyValueCases } from "./src/datasets/synthetic";

// ── Flat key-value extraction (deterministic, no network) ────────────────
const kvCases = generateKeyValueCases(
  "kv",
  [
    { name: "company", values: ["Acme Corp", "Globex Inc", "Initech LLC", "Umbrella Corp", "Soylent Corp"] },
    { name: "date", values: ["2024-01-15", "2023-06-30", "2025-03-01", "2022-12-25", "2024-07-04"] },
    { name: "amount", type: "number", values: ["1500", "42.50", "10000", "750", "3200.75"] },
    { name: "invoice_id", values: ["INV-001", "INV-042", "INV-500", "INV-007", "INV-999"] },
  ],
  20, // 20 cases — enough for stable means
  42, // seed
);

// ── Nested object extraction (synthetic, hand-written) ───────────────────
const nestedSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        zip: { type: ["string", "null"] },
      },
      required: ["street", "city", "zip"],
      additionalProperties: false,
    },
    contact: {
      type: "object",
      properties: {
        email: { type: "string" },
        phone: { type: ["string", "null"] },
      },
      required: ["email", "phone"],
      additionalProperties: false,
    },
  },
  required: ["name", "address", "contact"],
  additionalProperties: false,
};

const nestedCases: BenchmarkCase[] = [
  {
    id: "nested-1",
    schema: nestedSchema,
    gold: {
      name: "Alice Johnson",
      address: { street: "123 Main St", city: "Springfield", zip: "62701" },
      contact: { email: "alice@example.com", phone: "555-0101" },
    },
    artifacts: [textArtifact("Name: Alice Johnson\nAddress: 123 Main St, Springfield, IL 62701\nContact: alice@example.com, Phone: 555-0101", "nested-1")],
    source: { dataset: "nested-synthetic" },
  },
  {
    id: "nested-2",
    schema: nestedSchema,
    gold: {
      name: "Bob's Hardware",
      address: { street: "456 Oak Ave", city: "Portland", zip: "97201" },
      contact: { email: "info@bobshardware.com", phone: null },
    },
    artifacts: [textArtifact("Name: Bob's Hardware\nAddress: 456 Oak Ave, Portland, OR 97201\nContact: info@bobshardware.com", "nested-2")],
    source: { dataset: "nested-synthetic" },
  },
  {
    id: "nested-3",
    schema: nestedSchema,
    gold: {
      name: "Central Bank",
      address: { street: "1000 Finance Blvd", city: "New York", zip: "10005" },
      contact: { email: "support@centralbank.com", phone: "212-555-1000" },
    },
    artifacts: [textArtifact("Name: Central Bank\nAddress: 1000 Finance Blvd, New York, NY 10005\nContact: support@centralbank.com, Phone: 212-555-1000", "nested-3")],
    source: { dataset: "nested-synthetic" },
  },
  {
    id: "nested-4",
    schema: nestedSchema,
    gold: {
      name: "Green Fields Farm",
      address: { street: "789 Rural Route 7", city: "Boulder", zip: "80301" },
      contact: { email: "orders@greenfields.farm", phone: "303-555-0789" },
    },
    artifacts: [textArtifact("Name: Green Fields Farm\nAddress: 789 Rural Route 7, Boulder, CO 80301\nContact: orders@greenfields.farm, Phone: 303-555-0789", "nested-4")],
    source: { dataset: "nested-synthetic" },
  },
  {
    id: "nested-5",
    schema: nestedSchema,
    gold: {
      name: "TechNova Inc",
      address: { street: "50 Innovation Dr", city: "San Francisco", zip: "94105" },
      contact: { email: "hello@technova.io", phone: null },
    },
    artifacts: [textArtifact("Name: TechNova Inc\nAddress: 50 Innovation Dr, San Francisco, CA 94105\nContact: hello@technova.io", "nested-5")],
    source: { dataset: "nested-synthetic" },
  },
];

// ── Line-item extraction (array alignment) ────────────────────────────────
const itemsSchema = {
  type: "object",
  properties: {
    customer: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          qty: { type: "number" },
          price: { type: "number" },
        },
        required: ["name", "qty", "price"],
        additionalProperties: false,
      },
    },
  },
  required: ["customer", "items"],
  additionalProperties: false,
};

const itemsCases: BenchmarkCase[] = [
  {
    id: "items-1",
    schema: itemsSchema,
    gold: {
      customer: "John Doe",
      items: [
        { name: "Widget A", qty: 2, price: 9.99 },
        { name: "Gadget B", qty: 1, price: 24.50 },
        { name: "Cable C", qty: 5, price: 3.25 },
      ],
    },
    artifacts: [textArtifact(
      "Customer: John Doe\n\nItems:\n- Widget A, qty: 2, price: $9.99\n- Gadget B, qty: 1, price: $24.50\n- Cable C, qty: 5, price: $3.25",
      "items-1",
    )],
    metrics: { arrays: [{ path: "items", key: "name" }] },
    source: { dataset: "items-synthetic" },
  },
  {
    id: "items-2",
    schema: itemsSchema,
    gold: {
      customer: "Acme Corp",
      items: [
        { name: "Server Rack", qty: 4, price: 1200 },
        { name: "Power Supply", qty: 8, price: 85 },
        { name: "Network Switch", qty: 2, price: 450 },
        { name: "Patch Cable", qty: 50, price: 2.50 },
      ],
    },
    artifacts: [textArtifact(
      "Customer: Acme Corp\n\nItems:\n- Server Rack, qty: 4, price: $1,200.00\n- Power Supply, qty: 8, price: $85.00\n- Network Switch, qty: 2, price: $450.00\n- Patch Cable, qty: 50, price: $2.50",
      "items-2",
    )],
    metrics: { arrays: [{ path: "items", key: "name" }] },
    source: { dataset: "items-synthetic" },
  },
  {
    id: "items-3",
    schema: itemsSchema,
    gold: {
      customer: "Riverdale Clinic",
      items: [
        { name: "Bandages", qty: 100, price: 0.50 },
        { name: "Gloves", qty: 200, price: 0.15 },
        { name: "Syringes", qty: 50, price: 1.20 },
      ],
    },
    artifacts: [textArtifact(
      "Customer: Riverdale Clinic\n\nItems:\n- Bandages, qty: 100, price: $0.50\n- Gloves, qty: 200, price: $0.15\n- Syringes, qty: 50, price: $1.20",
      "items-3",
    )],
    metrics: { arrays: [{ path: "items", key: "name" }] },
    source: { dataset: "items-synthetic" },
  },
];

// ── All cases ─────────────────────────────────────────────────────────────
const allCases = [...kvCases, ...nestedCases, ...itemsCases];

// ── Strategies ────────────────────────────────────────────────────────────
const strategies = ["simple", "parallel", "sequential", "doublePass"] as const;

// ── Run ───────────────────────────────────────────────────────────────────
const report = await runBenchmark({
  cases: allCases,
  // ponytail: standard chunk size for the harness, override if needed
  strategies: [...strategies],
  cacheDir: ".benchmark-cache",
  cache: true,
  variant: "initial-baseline",
});

await saveReport(report, "BENCHMARK.json");
console.log("Report saved to BENCHMARK.json");

// Print summary to stderr for the script runner
const rows = report.summary;
console.error("\nSummary:");
for (const r of rows) {
  console.error(
    `${r.strategy.padEnd(12)} | ${r.track.padEnd(8)} | ${r.cases} cases | F1=${(r.meanF1 * 100).toFixed(1)}% | P=${(r.meanPrecision * 100).toFixed(1)}% R=${(r.meanRecall * 100).toFixed(1)}% | valid=${(r.validityRate * 100).toFixed(0)}% exact=${(r.exactMatchRate * 100).toFixed(0)}% | ${r.totalInputTokens} in / ${r.totalOutputTokens} out | $${r.totalCostUsd.toFixed(4)} | ${Math.round(r.meanLatencyMs)}ms avg (${r.totalLatencyMs}ms total)`,
  );
}