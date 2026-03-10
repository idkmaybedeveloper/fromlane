// NOTE(kroot): cli for getting stream urls

import "../env";
import { search, getTrackStream, formatDuration, loadEnvToken } from "../api";
import type { StreamOptions } from "../types";

loadEnvToken();

async function main() {
  const input = process.argv[2];
  const quality = process.argv[3] as StreamOptions["quality"] | undefined;

  if (!input) {
    console.log("usage: pnpm stream <track_id | search_query> [quality]");
    console.log("qualities: low, medium, high, lossless");
    console.log("examples:");
    console.log("  pnpm stream abc123xyz");
    console.log("  pnpm stream abc123xyz high");
    console.log("  pnpm stream \"кино группа крови\" lossless");
    process.exit(1);
  }

  try {
    // NOTE(kroot): check if input looks like a track id or search query
    const isTrackId = /^[a-zA-Z0-9_-]{10,}$/.test(input);

    let trackId: string;
    let trackInfo: { artist: string; title: string } | null = null;

    if (isTrackId) {
      trackId = input;
    } else {
      // NOTE(kroot): search for track
      console.log(`searching for: ${input}\n`);
      const results = await search(input);

      if (results.tracks.length === 0) {
        console.log("no tracks found");
        process.exit(1);
      }

      // NOTE(kroot): show top results
      console.log("found tracks:");
      for (let i = 0; i < Math.min(5, results.tracks.length); i++) {
        const track = results.tracks[i];
        console.log(
          `  [${i + 1}] ${track.artist} - ${track.title} (${formatDuration(track.duration)})`
        );
      }
      console.log("");

      const track = results.tracks[0];
      trackId = track.id;
      trackInfo = { artist: track.artist, title: track.title };
    }

    // NOTE(kroot): get stream url
    console.log("fetching stream url...\n");
    const stream = await getTrackStream(trackId, { quality });

    if (trackInfo) {
      console.log(`track: ${trackInfo.artist} - ${trackInfo.title}`);
    }
    console.log(`id: ${trackId}`);
    console.log(`quality: ${stream.quality}`);
    console.log(`format: ${stream.format}`);
    console.log(`expires: ${new Date(stream.expiresAt * 1000).toLocaleString()}`);
    console.log("");
    console.log("=== stream url ===");
    console.log(stream.url);
  } catch (error) {
    console.error("error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
