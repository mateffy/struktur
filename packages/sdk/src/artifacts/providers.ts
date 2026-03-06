import type { Artifact } from "../types";

export type ArtifactProvider = (buffer: Buffer) => Promise<Artifact>;

export type ArtifactProviders = Record<string, ArtifactProvider>;

export const defaultArtifactProviders: ArtifactProviders = {};
