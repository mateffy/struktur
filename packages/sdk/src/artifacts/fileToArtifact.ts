import type { Artifact } from "../types";
import { defaultArtifactProviders, type ArtifactProviders } from "./providers";

export type FileToArtifactOptions = {
  mimeType: string;
  providers?: ArtifactProviders;
};

const bufferToTextArtifact = (buffer: Buffer): Artifact => ({
  id: `artifact-${crypto.randomUUID()}`,
  type: "text",
  raw: async () => buffer,
  contents: [{ text: buffer.toString() }],
});

const bufferToImageArtifact = (buffer: Buffer): Artifact => ({
  id: `artifact-${crypto.randomUUID()}`,
  type: "image",
  raw: async () => buffer,
  contents: [{ media: [{ type: "image", contents: buffer }] }],
});

export const fileToArtifact = async (
  buffer: Buffer,
  options: FileToArtifactOptions,
): Promise<Artifact> => {
  const providers = options.providers ?? defaultArtifactProviders;
  const provider = providers[options.mimeType];
  if (provider) {
    return provider(buffer);
  }

  if (options.mimeType.startsWith("text/")) {
    return bufferToTextArtifact(buffer);
  }

  if (options.mimeType.startsWith("image/")) {
    return bufferToImageArtifact(buffer);
  }

  throw new Error(`No artifact provider registered for ${options.mimeType}`);
};
