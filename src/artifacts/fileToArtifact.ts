import type { Artifact } from "../types";
import { getArtifactProvider } from "./providers";

export type FileToArtifactOptions = {
  mimeType: string;
};

export const fileToArtifact = async (
  buffer: Buffer,
  options: FileToArtifactOptions
): Promise<Artifact> => {
  const provider = getArtifactProvider(options.mimeType);
  if (!provider) {
    throw new Error(`No artifact provider registered for ${options.mimeType}`);
  }

  return provider(buffer);
};
