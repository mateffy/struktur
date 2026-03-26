import type { Artifact } from "../types";

export const urlToArtifact = async (url: string): Promise<Artifact> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch artifact: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as Omit<Artifact, "raw"> & {
    raw?: () => Promise<Buffer>;
  };

  return {
    ...data,
    raw: data.raw ?? (async () => Buffer.from(JSON.stringify(data.contents ?? []))),
  };
};
