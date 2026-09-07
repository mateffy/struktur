# Benchmark report

- model: `openrouter/deepseek/deepseek-v4-flash-vision-exp`
- variant: `initial-baseline`
- generated: 2026-09-04T12:38:28.167Z

| strategy | track | cases | F1 | precision | recall | valid | exact | in tok | out tok | cost (USD) | ms/case | total ms |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| simple | text | 28 | 99.4% | 99.4% | 99.4% | 100.0% | 96.4% | 18833 | 4219 | 0.0069 | 1754 | 49102 |
| parallel | text | 28 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 30431 | 7133 | 0.0114 | 3508 | 98221 |
| sequential | text | 28 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 19525 | 4475 | 0.0072 | 2027 | 56769 |
| doublePass | text | 28 | 99.4% | 99.4% | 99.4% | 100.0% | 96.4% | 49144 | 10210 | 0.0176 | 8538 | 239052 |
| simple | text+embedded | 8 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 5562 | 1767 | 0.0024 | 2792 | 22332 |
| parallel | text+embedded | 8 | 95.8% | 95.8% | 95.8% | 100.0% | 75.0% | 9056 | 3474 | 0.0043 | 6642 | 53134 |
| sequential | text+embedded | 8 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 5607 | 1489 | 0.0022 | 2689 | 21512 |
| doublePass | text+embedded | 8 | 97.9% | 97.9% | 97.9% | 100.0% | 87.5% | 15186 | 4174 | 0.0061 | 7835 | 62676 |
| simple | text+screenshots | 8 | 97.9% | 97.9% | 97.9% | 100.0% | 87.5% | 5723 | 2796 | 0.0031 | 4291 | 34330 |
| parallel | text+screenshots | 8 | 97.9% | 97.9% | 97.9% | 100.0% | 87.5% | 9054 | 3711 | 0.0044 | 5059 | 40473 |
| sequential | text+screenshots | 8 | 97.9% | 97.9% | 97.9% | 100.0% | 87.5% | 5607 | 1698 | 0.0024 | 3677 | 29418 |
| doublePass | text+screenshots | 8 | 97.9% | 97.9% | 97.9% | 100.0% | 87.5% | 15186 | 3988 | 0.0060 | 7723 | 61785 |
| simple | text+embedded+screenshots | 8 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 5723 | 2300 | 0.0028 | 2962 | 23699 |
| parallel | text+embedded+screenshots | 8 | 97.9% | 97.9% | 97.9% | 100.0% | 87.5% | 9054 | 2692 | 0.0038 | 4283 | 34264 |
| sequential | text+embedded+screenshots | 8 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 5607 | 1520 | 0.0022 | 3689 | 29511 |
| doublePass | text+embedded+screenshots | 8 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | 15343 | 3595 | 0.0057 | 6217 | 49739 |