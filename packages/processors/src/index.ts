/**
 * @struktur/processors — dependency wrapper for PDF processor adapters
 *
 * Installs optional npm dependencies needed by LiteParse and Kreuzberg
 * PDF processors. Importing this package ensures those processors are
 * available when the CLI runs.
 *
 * The SDK stays lightweight — only this package pulls in the heavier deps.
 *
 * Usage:
 *   import "@struktur/processors";
 *
 * Then `struktur parse --processor liteparse` works without any extra install.
 */

// Trigger processor registration from the SDK.
// This ensures all built-in processors (pdf-parse, vlm, docling, liteparse,
// kreuzberg) are registered in the global processor registry.
import "@struktur/sdk/parsers";
