// NOTE(kroot): cli for searching tracks

import "../env";
import { search, formatDuration, loadEnvToken } from "../api";

loadEnvToken();

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.log("usage: pnpm search <query>");
    console.log("example: pnpm search \"кино группа крови\"");
    process.exit(1);
  }

  try {
    console.log(`searching for: ${query}\n`);
    const results = await search(query);

    // NOTE(kroot): display tracks
    if (results.tracks.length > 0) {
      console.log(`=== tracks (${results.tracks.length}) ===\n`);
      for (const track of results.tracks.slice(0, 10)) {
        console.log(`[${track.id}] ${track.artist} - ${track.title}`);
        console.log(`  album: ${track.album}`);
        console.log(`  duration: ${formatDuration(track.duration)}`);
        console.log(`  platform: ${track.platform}`);
        if (track.explicit) console.log(`  explicit: yes`);
        console.log("");
      }
    }

    // NOTE(kroot): display artists
    if (results.artists.length > 0) {
      console.log(`=== artists (${results.artists.length}) ===\n`);
      for (const artist of results.artists.slice(0, 5)) {
        console.log(`[${artist.id}] ${artist.name}`);
        if (artist.verified) console.log(`  verified: yes`);
        console.log("");
      }
    }

    // NOTE(kroot): display albums
    if (results.albums.length > 0) {
      console.log(`albums (${results.albums.length})\n`);
      for (const album of results.albums.slice(0, 5)) {
        console.log(`[${album.id}] ${album.artist} - ${album.title}`);
        console.log(`tracks: ${album.trackCount}`);
        console.log(`release: ${album.releaseDate}`);
        console.log("");
      }
    }

    if (
      results.tracks.length === 0 &&
      results.artists.length === 0 &&
      results.albums.length === 0
    ) {
      console.log("no results found");
    }
  } catch (error) {
    console.error("error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
