# Benchmark report

- model: `openrouter/deepseek/deepseek-v4-flash-vision-exp`
- variant: `sroie-1`
- generated: 2026-09-04T19:15:34.731Z

| strategy | track | cases | F1 | precision | recall | valid | exact | in tok | out tok | cost (USD) | ms/case | total ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | text | 973 | 76.4% | 77.7% | 76.3% | 99.8% | 33.6% | 1185521 | 1527440 | 1.2689 | 16605 | 16156688 |
| parallel | text | 973 | 75.2% | 77.6% | 75.1% | 99.1% | 32.4% | 1693297 | 1717010 | 1.5058 | 21034 | 20465862 |
| sequential | text | 973 | 80.6% | 80.9% | 80.6% | 100.0% | 41.1% | 1078869 | 672229 | 0.6810 | 7572 | 7367563 |
| doublePass | text | 973 | 78.5% | 78.9% | 78.5% | 99.6% | 35.6% | 2811889 | 1994051 | 1.9347 | 27781 | 27030655 |