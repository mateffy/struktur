import type { Artifact, SerializedArtifact, SerializedArtifactContent } from "@struktur/sdk";

export function serializeArtifacts(artifacts: Artifact[]): SerializedArtifact[] {
  return artifacts.map((a) => ({
    id: a.id,
    type: a.type,
    contents: a.contents.map(
      (c): SerializedArtifactContent => ({
        ...(c.page !== undefined ? { page: c.page } : {}),
        ...(c.text !== undefined ? { text: c.text } : {}),
        ...(c.media
          ? {
              media: c.media.map((m) => ({
                type: "image" as const,
                ...(m.url ? { url: m.url } : {}),
                ...(m.base64 ? { base64: m.base64 } : {}),
                ...(m.contents ? { base64: m.contents.toString("base64") } : {}),
                ...(m.text ? { text: m.text } : {}),
                ...(m.width !== undefined ? { width: m.width } : {}),
                ...(m.height !== undefined ? { height: m.height } : {}),
                ...(m.imageType ? { imageType: m.imageType } : {}),
              })),
            }
          : {}),
      }),
    ),
    ...(a.metadata ? { metadata: a.metadata } : {}),
  }));
}
