import type { Artifact, ArtifactContent, ArtifactImage } from "./types";

export type TokenCountOptions = {
  textTokenRatio?: number;
  defaultImageTokens?: number;
};

const defaultOptions: Required<TokenCountOptions> = {
  textTokenRatio: 4,
  defaultImageTokens: 1000,
};

const mergeOptions = (options?: TokenCountOptions) => ({
  ...defaultOptions,
  ...(options ?? {}),
});

export const estimateTextTokens = (text: string, options?: TokenCountOptions) => {
  const { textTokenRatio } = mergeOptions(options);
  return Math.ceil(text.length / textTokenRatio);
};

export const estimateImageTokens = (
  _image: ArtifactImage,
  options?: TokenCountOptions
) => {
  const { defaultImageTokens } = mergeOptions(options);
  return defaultImageTokens;
};

export const countContentTokens = (
  content: ArtifactContent,
  options?: TokenCountOptions
) => {
  let tokens = 0;

  if (content.text) {
    tokens += estimateTextTokens(content.text, options);
  }

  if (content.media?.length) {
    for (const media of content.media) {
      tokens += estimateImageTokens(media, options);
      if (media.text) {
        tokens += estimateTextTokens(media.text, options);
      }
    }
  }

  return tokens;
};

export const countArtifactTokens = (
  artifact: Artifact,
  options?: TokenCountOptions
) => {
  if (typeof artifact.tokens === "number") {
    return artifact.tokens;
  }

  return artifact.contents.reduce(
    (total, content) => total + countContentTokens(content, options),
    0
  );
};

export const countArtifactImages = (artifact: Artifact) => {
  return artifact.contents.reduce((count, content) => {
    return count + (content.media?.length ?? 0);
  }, 0);
};
