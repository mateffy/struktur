import { Readable } from "node:stream";
import busboy from "busboy";
import { Hono } from "hono";
import {
	type ExtractionEvent,
	extractData,
	generateExtractionId,
	parseFiles,
	saveExtraction,
} from "./api";
import { fetchConfig, fetchModels } from "./models";

export const app = new Hono();

app.post("/api/parse", async (c) => {
	const contentType = c.req.header("content-type");
	if (!contentType?.includes("multipart/form-data")) {
		return c.json({ error: "Expected multipart/form-data" }, 400);
	}

	const bodyBuffer = await c.req.arrayBuffer();

	const files: File[] = [];
	let options: any = {};

	await new Promise<void>((resolve, reject) => {
		const headers: Record<string, string> = {};
		c.req.raw.headers.forEach((v, k) => {
			headers[k] = v;
		});

		const bb = busboy({
			headers,
			limits: { fileSize: 100 * 1024 * 1024 },
		});

		bb.on("file", (name, stream, info) => {
			const chunks: Buffer[] = [];
			stream.on("data", (chunk: Buffer) => chunks.push(chunk));
			stream.on("end", () => {
				const data = Buffer.concat(chunks);
				const file = new File([data], info.filename || name, {
					type: info.mimeType || "application/octet-stream",
				});
				files.push(file);
			});
		});

		bb.on("field", (name, val) => {
			if (name === "options") {
				options = JSON.parse(val);
			}
		});

		bb.on("close", () => resolve());
		bb.on("error", reject);

		const nodeStream = Readable.from(Buffer.from(bodyBuffer));
		nodeStream.pipe(bb);
	});

	if (files.length === 0) {
		return c.json({ error: "No files provided" }, 400);
	}

	const artifacts = await parseFiles(files, options);

	return c.json({ artifacts });
});

app.post("/api/extract", async (c) => {
	const contentType = c.req.header("content-type");
	if (!contentType?.includes("multipart/form-data")) {
		return c.json({ error: "Expected multipart/form-data" }, 400);
	}

	const bodyBuffer = await c.req.arrayBuffer();

	const files: File[] = [];
	let params: any = {};

	await new Promise<void>((resolve, reject) => {
		const headers: Record<string, string> = {};
		c.req.raw.headers.forEach((v, k) => {
			headers[k] = v;
		});

		const bb = busboy({
			headers,
			limits: { fileSize: 100 * 1024 * 1024 },
		});

		bb.on("file", (name, stream, info) => {
			const chunks: Buffer[] = [];
			stream.on("data", (chunk: Buffer) => chunks.push(chunk));
			stream.on("end", () => {
				const data = Buffer.concat(chunks);
				const file = new File([data], info.filename || name, {
					type: info.mimeType || "application/octet-stream",
				});
				files.push(file);
			});
		});

		bb.on("field", (name, val) => {
			if (name === "params") {
				params = JSON.parse(val);
			}
		});

		bb.on("close", () => resolve());
		bb.on("error", reject);

		const nodeStream = Readable.from(Buffer.from(bodyBuffer));
		nodeStream.pipe(bb);
	});

	if (files.length === 0) {
		return c.json({ error: "No files provided" }, 400);
	}

	const {
		schemaMode,
		schemaJson,
		fields,
		model,
		strategy,
		chunkSize,
		parsingOptions,
		apiKey,
	} = params;

	const artifacts = await parseFiles(files, parsingOptions ?? {});

	const result = await extractData(
		artifacts,
		schemaMode,
		schemaJson,
		fields,
		model,
		strategy,
		chunkSize,
		apiKey,
	);

	const id = generateExtractionId();
	const savedPath = await saveExtraction(id, {
		files: files.map((f) => f.name),
		schema: schemaMode === "json" ? schemaJson : fields,
		result: result.data,
		artifacts,
	});

	return c.json({
		artifacts,
		result,
		savedPath,
	});
});

app.post("/api/extract/stream", async (c) => {
	const contentType = c.req.header("content-type");
	if (!contentType?.includes("multipart/form-data")) {
		return c.json({ error: "Expected multipart/form-data" }, 400);
	}

	const bodyBuffer = await c.req.arrayBuffer();

	const files: File[] = [];
	let params: any = {};

	await new Promise<void>((resolve, reject) => {
		const headers: Record<string, string> = {};
		c.req.raw.headers.forEach((v, k) => {
			headers[k] = v;
		});

		const bb = busboy({
			headers,
			limits: { fileSize: 100 * 1024 * 1024 },
		});

		bb.on("file", (name, stream, info) => {
			const chunks: Buffer[] = [];
			stream.on("data", (chunk: Buffer) => chunks.push(chunk));
			stream.on("end", () => {
				const data = Buffer.concat(chunks);
				const file = new File([data], info.filename || name, {
					type: info.mimeType || "application/octet-stream",
				});
				files.push(file);
			});
		});

		bb.on("field", (name, val) => {
			if (name === "params") {
				params = JSON.parse(val);
			}
		});

		bb.on("close", () => resolve());
		bb.on("error", reject);

		const nodeStream = Readable.from(Buffer.from(bodyBuffer));
		nodeStream.pipe(bb);
	});

	if (files.length === 0) {
		return c.json({ error: "No files provided" }, 400);
	}

	const {
		schemaMode,
		schemaJson,
		fields,
		model,
		strategy,
		chunkSize,
		parsingOptions,
		apiKey,
	} = params;

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();

			const sendEvent = (event: ExtractionEvent) => {
				const data = JSON.stringify(event);
				controller.enqueue(encoder.encode(`data: ${data}\n\n`));
			};

			try {
				sendEvent({
					type: "step",
					data: { step: 0, total: 1, label: "parsing" },
				});
				const artifacts = await parseFiles(files, parsingOptions ?? {});
				sendEvent({
					type: "step",
					data: {
						step: 1,
						total: 1,
						label: "parsed",
						data: { artifactCount: artifacts.length },
					},
				});

				const result = await extractData(
					artifacts,
					schemaMode,
					schemaJson,
					fields,
					model,
					strategy,
					chunkSize,
					apiKey,
					sendEvent,
				);

				const id = generateExtractionId();
				const savedPath = await saveExtraction(id, {
					files: files.map((f) => f.name),
					schema: schemaMode === "json" ? schemaJson : fields,
					result: result.data,
					artifacts,
				});

				sendEvent({ type: "complete", data: { result, savedPath, artifacts } });
			} catch (error) {
				sendEvent({
					type: "error",
					data: { message: (error as Error).message },
				});
			} finally {
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
});

app.get("/api/models", async (c) => {
	const models = await fetchModels();
	return c.json(models);
});

app.get("/api/config", async (c) => {
	const config = await fetchConfig();
	return c.json(config);
});
