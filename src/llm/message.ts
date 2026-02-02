import type { Artifact } from "../types";

export type ImagePart = {
  type: "image";
  image: string | Buffer;
};

export type TextPart = {
  type: "text";
  text: string;
};

export type UserContent = string | Array<TextPart | ImagePart>;

const collectImages = (artifacts: Artifact[]): ImagePart[] => {
  const parts: ImagePart[] = [];

  for (const artifact of artifacts) {
    for (const content of artifact.contents) {
      if (!content.media?.length) {
        continue;
      }

      for (const media of content.media) {
        if (media.contents) {
          parts.push({ type: "image", image: media.contents });
        } else if (media.base64) {
          parts.push({ type: "image", image: media.base64 });
        } else if (media.url) {
          parts.push({ type: "image", image: media.url });
        }
      }
    }
  }

  return parts;
};

export const buildUserContent = (text: string, artifacts: Artifact[]): UserContent => {
  const images = collectImages(artifacts);

  if (images.length === 0) {
    return text;
  }

  return [{ type: "text", text }, ...images];
};
