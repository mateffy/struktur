import type { Artifact, ArtifactImage } from "../types";

const imageRefFor = (artifactId: string, index: number, image: ArtifactImage) => {
  // Prefer the stable virtual filesystem path (set by createVirtualFilesystem/
  // the agent strategy) so the model can reference images by their exact path
  // in the output. Fall back to URL or a synthetic artifact ref.
  if (image.virtualPath) {
    return image.virtualPath;
  }

  if (image.url) {
    return image.url;
  }

  const extension = image.base64 ? "png" : "bin";
  return `artifact:${artifactId}/images/image${index + 1}.${extension}`;
};

const escapeXml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export const formatArtifactsXml = (artifacts: Artifact[]) => {
  const parts: string[] = [];

  for (const artifact of artifacts) {
    parts.push(`<artifact id="${escapeXml(artifact.id)}" type="${artifact.type}">`);

    for (const content of artifact.contents) {
      if (content.text) {
        const pageAttr = content.page !== undefined ? ` page="${content.page}"` : "";
        parts.push(`  <text${pageAttr}>${escapeXml(content.text)}</text>`);
      }

      if (content.media?.length) {
        content.media.forEach((media, index) => {
          const ref = imageRefFor(artifact.id, index, media);
          const pageAttr = content.page !== undefined ? ` page="${content.page}"` : "";
          parts.push(`  <image ref="${escapeXml(ref)}"${pageAttr} />`);
        });
      }
    }

    parts.push("</artifact>");
  }

  return parts.join("\n");
};
