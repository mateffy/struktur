import type { Artifact, ArtifactContent, ArtifactImage } from "@struktur/sdk";

// Image format detection from base64 signatures
const detectImageFormat = (base64: string): string => {
  // JPEG: base64 starts with /9j/ (FF D8 FF)
  if (base64.startsWith("/9j/")) {
    return "jpg";
  }
  // PNG: base64 starts with iVBOR (89 50 4E 47)
  if (base64.startsWith("iVBOR")) {
    return "png";
  }
  // GIF: base64 starts with R0lGOD (47 49 46 38)
  if (base64.startsWith("R0lGOD")) {
    return "gif";
  }
  // WebP: base64 starts with UklGR (52 49 46 46)
  if (base64.startsWith("UklGR")) {
    return "webp";
  }
  // BMP: base64 starts with Qk (42 4D)
  if (base64.startsWith("Qk")) {
    return "bmp";
  }
  // SVG: starts with data URI or PHN2Zy (base64 of <svg)
  if (base64.startsWith("PHN2Zy") || base64.startsWith("data:image/svg")) {
    return "svg";
  }
  // Default to bin if unknown
  return "bin";
};

// Sanitize artifact name for use in filename
const sanitizeArtifactName = (name: string): string => {
  // Replace spaces and special chars with dashes
  return name
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
};

export type TransformedArtifact = {
  id: string;
  type: string;
  metadata?: Record<string, unknown>;
  tokens?: number;
  contents: Array<{
    page?: number;
    text?: string;
    media?: Array<{
      type: string;
      url?: string;
      text?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      imageType?: string;
      // Replaced base64 with virtual file path
      virtualPath?: string;
      originalBase64?: string; // Kept for internal reference
    }>;
  }>;
};

export type ArtifactsManifest = {
  count: number;
  artifacts: TransformedArtifact[];
  totalTokens?: number;
  summary: {
    textArtifacts: number;
    imageArtifacts: number;
    pdfArtifacts: number;
    fileArtifacts: number;
  };
  virtualFiles: {
    count: number;
    paths: string[];
  };
};

export type VirtualFilesystemResult = {
  // The main artifact JSON with base64 replaced by virtual paths
  "/artifact.json": string;
  // Manifest with summary
  "/manifest.json": string;
  // Virtual files mapping: path -> base64 content
  virtualFiles: Map<string, string>;
  // Helper to get image data by virtual path
  getImageByPath: (path: string) => string | undefined;
};

export const createVirtualFilesystem = (
  artifacts: Artifact[]
): VirtualFilesystemResult => {
  const virtualFiles = new Map<string, string>();

  // Transform artifacts, extracting base64 images to virtual files
  const transformedArtifacts: TransformedArtifact[] = artifacts.map((artifact) => {
    // Create a sanitized base name from artifact id
    const artifactName = sanitizeArtifactName(artifact.id);
    
    return {
      id: artifact.id,
      type: artifact.type,
      metadata: artifact.metadata,
      tokens: artifact.tokens,
      contents: artifact.contents.map((content: ArtifactContent, contentIndex: number) => {
        const pageNumber = content.page;
        
        return {
          page: content.page,
          text: content.text,
          media: content.media?.map((media: ArtifactImage, mediaIndex: number) => {
            // If there's base64 content, create a virtual file
            if (media.base64 && media.base64.length > 0) {
              // Detect image format from base64
              const extension = detectImageFormat(media.base64);
              
              // Create descriptive filename
              let virtualPath: string;
              if (pageNumber !== undefined) {
                // If we have a page number, include it in the filename
                virtualPath = `/images/${artifactName}-page-${pageNumber}-image-${mediaIndex}.${extension}`;
              } else {
                // No page number, just use artifact name and image index
                virtualPath = `/images/${artifactName}-image-${mediaIndex}.${extension}`;
              }
              
              // Store the base64 content in the virtual filesystem
              virtualFiles.set(virtualPath, media.base64);
              
              return {
                type: media.type,
                url: media.url,
                text: media.text,
                x: media.x,
                y: media.y,
                width: media.width,
                height: media.height,
                imageType: media.imageType,
                virtualPath: virtualPath,
                originalBase64: `[BASE64: ${media.base64.length} chars]`, // For debugging
              };
            }
            
            // No base64, just return the media as-is
            return {
              type: media.type,
              url: media.url,
              text: media.text,
              x: media.x,
              y: media.y,
              width: media.width,
              height: media.height,
              imageType: media.imageType,
            };
          }),
        };
      }),
    };
  });

  // Count images with base64
  const totalImagesWithBase64 = Array.from(virtualFiles.keys()).length;

  const manifest: ArtifactsManifest = {
    count: artifacts.length,
    artifacts: transformedArtifacts,
    totalTokens: transformedArtifacts.reduce((sum, a) => sum + (a.tokens || 0), 0),
    summary: {
      textArtifacts: artifacts.filter((a) => a.type === "text").length,
      imageArtifacts: artifacts.filter((a) => a.type === "image").length,
      pdfArtifacts: artifacts.filter((a) => a.type === "pdf").length,
      fileArtifacts: artifacts.filter((a) => a.type === "file").length,
    },
    virtualFiles: {
      count: totalImagesWithBase64,
      paths: Array.from(virtualFiles.keys()),
    },
  };

  // Helper function to retrieve image by path
  const getImageByPath = (path: string): string | undefined => {
    return virtualFiles.get(path);
  };

  // Create the filesystem entries
  const filesystem: VirtualFilesystemResult = {
    "/artifact.json": JSON.stringify(transformedArtifacts, null, 2),
    "/manifest.json": JSON.stringify(manifest, null, 2),
    virtualFiles,
    getImageByPath,
  };

  return filesystem;
};

// Legacy export for backward compatibility
export const serializeArtifactsToFilesystem = (
  artifacts: Artifact[]
): { 
  "/artifact.json": string; 
  "/manifest.json": string 
} => {
  const result = createVirtualFilesystem(artifacts);
  return {
    "/artifact.json": result["/artifact.json"],
    "/manifest.json": result["/manifest.json"],
  };
};

export type { Artifact, ArtifactContent, ArtifactImage };
