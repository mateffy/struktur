import type { Artifact } from "../types";

export type ArtifactProvider = (buffer: Buffer) => Promise<Artifact>;

const providers = new Map<string, ArtifactProvider>();

export const registerArtifactProvider = (
  mimeType: string,
  provider: ArtifactProvider
) => {
  providers.set(mimeType, provider);
};

export const getArtifactProvider = (mimeType: string) => {
  return providers.get(mimeType);
};

export const clearArtifactProviders = () => {
  providers.clear();
};
