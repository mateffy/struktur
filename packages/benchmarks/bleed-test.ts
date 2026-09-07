import { runBenchmark, type BenchmarkCase } from "./src/index";
import { textArtifact } from "./src/datasets/synthetic";

// Parse "123 Main St, Springfield, IL 62701" → {street, city, zip}
function parseAddr(addr: string) {
  const m = addr.match(/^(.+), ([^,]+), \w{2} (\d{5})$/);
  return { street: m?.[1] ?? addr, city: m?.[2] ?? "", zip: m?.[3] ?? "" };
}

const base = [
  {
    name: "Alice Johnson",
    addr: "123 Main St, Springfield, IL 62701",
    email: "alice@example.com",
    phone: "555-0101",
  },
  {
    name: "Bob's Hardware",
    addr: "456 Oak Ave, Portland, OR 97201",
    email: "info@bobshardware.com",
    phone: null,
  },
  {
    name: "Central Bank",
    addr: "1000 Finance Blvd, New York, NY 10005",
    email: "support@centralbank.com",
    phone: "212-555-1000",
  },
  {
    name: "Green Fields",
    addr: "789 Rural Route 7, Boulder, CO 80301",
    email: "orders@greenfields.farm",
    phone: "303-555-0789",
  },
  {
    name: "TechNova Inc",
    addr: "50 Innovation Dr, San Francisco, CA 94105",
    email: "hello@technova.io",
    phone: null,
  },
];

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    address: {
      type: "object",
      properties: {
        street: { type: "string", description: "Street address only — no city, state, or zip" },
        city: {
          type: "string",
          description: "City name only — no state abbreviation, no zip code",
        },
        zip: { type: "string", description: "5-digit ZIP code only — no letters, no state prefix" },
      },
      required: ["street", "city", "zip"],
      additionalProperties: false,
    },
    contact: {
      type: "object",
      properties: { email: { type: "string" }, phone: { type: ["string", "null"] } },
      required: ["email", "phone"],
      additionalProperties: false,
    },
  },
  required: ["name", "address", "contact"],
  additionalProperties: false,
} as const;

// Variant A: natural text — the hard case that triggers bleeding
const a = base.map((b) => {
  const a = parseAddr(b.addr);
  return {
    id: `bleed-A-${b.name.replace(/[^a-zA-Z]/g, "")}`,
    schema,
    gold: { name: b.name, address: a, contact: { email: b.email, phone: b.phone } },
    artifacts: [
      textArtifact(
        `Name: ${b.name}\nAddress: ${b.addr}\nContact: ${b.email}${b.phone ? `, Phone: ${b.phone}` : ""}`,
        `art-${b.name}`,
      ),
    ],
    tracks: ["text"],
  } as BenchmarkCase;
});

// Variant B: markdown-like with labels (should be easier)
const b = base.map((b) => {
  const a = parseAddr(b.addr);
  return {
    id: `bleed-B-${b.name.replace(/[^a-zA-Z]/g, "")}`,
    schema,
    gold: { name: b.name, address: a, contact: { email: b.email, phone: b.phone } },
    artifacts: [
      textArtifact(
        `NAME: ${b.name}\nSTR: ${a.street}\nCITY: ${a.city}\nZIP: ${a.zip}\nMAIL: ${b.email}${b.phone ? `\nPH: ${b.phone}` : ""}`,
        `art-${b.name}`,
      ),
    ],
    tracks: ["text"],
  } as BenchmarkCase;
});

const cases = [...a, ...b];
console.error(`\nRunning ${cases.length} bleed-focused cases...`);

const report = await runBenchmark({ cases, strategies: ["simple"], variant: "bleed-iter-v1" });
for (const c of report.cells) {
  if (!c.score.exactMatch) {
    console.error(`FAIL ${c.caseId}:`);
    for (const fe of c.score.fieldErrors)
      console.error(
        `  ${fe.path} | gold: ${JSON.stringify(fe.gold)} | pred: ${JSON.stringify(fe.pred)}`,
      );
  }
}
const exact = report.cells.filter((c) => c.score.exactMatch).length;
console.error(
  `\n${exact}/${report.cells.length} exact (${((exact / report.cells.length) * 100).toFixed(0)}%)\n`,
);
