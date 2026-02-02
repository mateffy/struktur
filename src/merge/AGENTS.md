Merge module

- Purpose: schema-aware merging and deduplication of extracted data.
- Key files: `SmartDataMerger.ts`, `Deduplicator.ts`.
- Design: arrays concatenate, objects shallow-merge, scalars prefer new values; dedupe uses CRC32 hashing.
- Tests: `SmartDataMerger.test.ts`, `Deduplicator.test.ts`.
