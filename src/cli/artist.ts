// NOTE(kroot): cli for fetching artist info

import "../env";
import { search, getArtist, formatDuration, loadEnvToken } from "../api";

loadEnvToken();

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.log("usage: pnpm artist <artist_id | search_query>");
    console.log("examples:");
    console.log("pnpm artist abc123xyz");
    console.log("pnpm artist \"кино\"");
    process.exit(1);
  }

  try {
    // NOTE(kroot): check if input looks like an id or search query
    const isId = /^[a-zA-Z0-9_-]{10,}$/.test(input);

    let artistId: string;

    if (isId) {
      artistId = input;
    } else {
      // NOTE(kroot): search for artist
      console.log(`searching for: ${input}\n`);
      const results = await search(input);

      if (results.artists.length === 0) {
        console.log("no artists found");
        process.exit(1);
      }

      // NOTE(kroot): show found artists
      console.log("found artists:");
      for (let i = 0; i < Math.min(5, results.artists.length); i++) {
        const artist = results.artists[i];
        const verified = artist.verified ? " ✓" : "";
        console.log(`  [${i + 1}] ${artist.name}${verified}`);
      }
      console.log("");

      artistId = results.artists[0].id;
    }

    // NOTE(kroot): fetch artist details
    console.log("fetching artist details...\n");
    const artist = await getArtist(artistId);

    console.log("artist");
    console.log(`name: ${artist.name}`);
    console.log(`id: ${artist.id}`);
    console.log(`verified: ${artist.verified ? "yes" : "no"}`);
    console.log(`monthly listeners: ${artist.monthlyListeners.toLocaleString()}`);
    console.log(`image: ${artist.imageUrl}`);
  } catch (error) {
    console.error("error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
