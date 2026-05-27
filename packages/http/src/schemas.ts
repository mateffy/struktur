import { z } from "zod";

export const MediaSchema = z.object({
  type: z.literal("image"),
  url: z.string().optional(),
  base64: z.string().optional(),
  text: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  imageType: z.string().optional(),
});

export const ArtifactContentSchema = z.object({
  page: z.number().optional(),
  text: z.string().optional(),
  media: z.array(MediaSchema).optional(),
});

export const ArtifactSchema = z.object({
  id: z.string(),
  type: z.string(),
  contents: z.array(ArtifactContentSchema),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ArtifactsResponseSchema = z.object({
  artifacts: z.array(ArtifactSchema),
});

export const ExtractRequestSchema = z.object({
  artifacts: z.array(ArtifactSchema).optional(),
  schema: z.record(z.string(), z.unknown()).optional(),
  fields: z.string().optional(),
  model: z.string(),
  strategy: z
    .enum([
      "simple",
      "parallel",
      "sequential",
      "parallelAutoMerge",
      "sequentialAutoMerge",
      "doublePass",
      "doublePassAutoMerge",
      "agent",
    ])
    .optional(),
  chunkSize: z.number().optional(),
  maxSteps: z.number().optional(),
  strict: z.boolean().optional(),
});

export const UsageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
});

export const ExtractResponseSchema = z.object({
  data: z.unknown(),
  usage: UsageSchema,
  error: z.string().optional(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
});

export const APIInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  endpoints: z.record(z.string(), z.string()),
});
