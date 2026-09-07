import { parsePdf } from "@struktur/sdk";
import type { Artifact } from "@struktur/sdk";
import type { Track } from "./types";

/** Map a track to the PDF parse flags that produce it. */
export const trackToPdfOptions = (track: Track): { includeImages: boolean; screenshots: boolean } => {
  switch (track) {
    case "text":
      return { includeImages: false, screenshots: false };
    case "text+embedded":
      return { includeImages: true, screenshots: false };
    case "text+screenshots":
      return { includeImages: false, screenshots: true };
    case "text+embedded+screenshots":
      return { includeImages: true, screenshots: true };
  }
};

/**
 * Produce the artifact set for a track.
 *
 * PDF artifacts are re-parsed from their raw bytes with the track's image
 * flags (the parser always keeps text). Image/text/file artifacts are returned
 * unchanged — their media is intrinsic and can't be toggled off.
 */
export async function materializeTrack(artifacts: Artifact[], track: Track): Promise<Artifact[]> {
  return Promise.all(
    artifacts.map(async (artifact) => {
      if (artifact.type !== "pdf") return artifact;
      const buffer = await artifact.raw();
      return parsePdf(buffer, trackToPdfOptions(track));
    }),
  );
}
