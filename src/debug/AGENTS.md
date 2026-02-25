# Debug Module

## Overview

The debug module provides comprehensive JSON logging for the Struktur extraction pipeline. When `--debug` flag is enabled via CLI, every operation is logged as single-line JSON to stderr.

## Key Files

- `logger.ts`: Core debug logger with structured logging functions for every pipeline stage.

## Debug Log Types

### CLI Initialization
- `cli_init`: CLI arguments and configuration
- `schema_loaded`: Schema source and size
- `artifacts_loaded`: Artifact count, types, tokens, images
- `model_resolved`: Model specification resolution
- `strategy_created`: Strategy selection with config

### Chunking
- `chunking_start`: Per-artifact chunking begins
- `chunking_split`: Text or content splits due to limits
- `chunking_result`: Final chunks created with sizes

### Batching
- `batching_start`: Batch creation parameters
- `batch_created`: Individual batch details
- `batching_complete`: Summary of all batches

### Strategy Execution
- `strategy_run_start`: Strategy begins with estimated steps
- `step`: Step progression through pipeline
- `progress`: Progress updates within steps

### LLM Calls
- `llm_call_start`: API call initiation with prompt sizes
- `prompt_system`: Full system prompt (verbose)
- `prompt_user`: Full user content (verbose)
- `llm_call_complete`: Call completion with tokens/timing
- `raw_response`: Raw LLM response data (verbose)

### Validation
- `validation_start`: Validation attempt begins
- `validation_success`: Validation passed
- `validation_failed`: Validation errors
- `retry`: Retry attempt triggered

### Merging
- `merge_start`: Merge operation begins
- `smart_merge_field`: Per-field merge operations
- `merge_complete`: Merge success/failure

### Deduplication
- `dedupe_start`: Deduplication begins
- `dedupe_complete`: Duplicates found and removed

### Results
- `token_usage`: Token consumption tracking
- `extraction_complete`: Final extraction status

## Usage

Enable via CLI:
```bash
struktur extract --debug -t "text to extract" -s schema.json
```

Debug logs are written to stderr as single-line JSON:
```json
{"timestamp":"2026-02-24T20:00:00.000Z","type":"cli_init","args":{"strategy":"simple"}}
```

## Design Notes

- All logs include ISO8601 timestamps
- Logs are single-line JSON for easy parsing
- Output goes to stderr to not interfere with stdout results
- The debug logger is passed through the entire pipeline via `ExtractionOptions.debug`
- When debug is disabled (default), all logging calls are no-ops
