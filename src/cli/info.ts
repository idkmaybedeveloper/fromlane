// NOTE(kroot): cli for fetching track info

import "../env";
import {
  search,
  getTrackStats,
  getTrackLyrics,
  formatDuration,
  loadEnvToken,
} from "../api";

loadEnvToken();

async function main() {
  const input = process.argv[2];
  const showLyrics = process.argv.includes("--lyrics");

  if (!input) {
    console.log("usage: pnpm info <track_id | search_query> [--lyrics]");
    console.log("examples:");
    console.log("pnpm info abc123xyz");
    console.log("pnpm info \"кино группа крови\"");
    console.log("pnpm info \"кино\" --lyrics");
    process.exit(1);
  }

  try {
    // NOTE(kroot): check if input looks like a track id or search query
    const isTrackId = /^[a-zA-Z0-9_-]{10,}$/.test(input);

    let trackId: string;
    let trackInfo: { artist: string; title: string; album: string; duration: number } | null = null;

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

      const track = results.tracks[0];
      trackId = track.id;
      trackInfo = {
        artist: track.artist,
        title: track.title,
        album: track.album,
        duration: track.duration,
      };
    }

    // NOTE(kroot): display basic info if we have it
    if (trackInfo) {
      console.log(`track: ${trackInfo.artist} - ${trackInfo.title}`);
      console.log(`album: ${trackInfo.album}`);
      console.log(`duration: ${formatDuration(trackInfo.duration)}`);
      console.log(`id: ${trackId}`);
      console.log("");
    } else {
      console.log(`track id: ${trackId}\n`);
    }

    // NOTE(kroot): fetch stats
    try {
      const stats = await getTrackStats(trackId);
      console.log("stats");
      console.log(`plays: ${stats.plays.toLocaleString()}`);
      console.log(`likes: ${stats.likes.toLocaleString()}`);
      console.log(`comments: ${stats.comments.toLocaleString()}`);
      console.log("");
    } catch {
      console.log("stats: not available\n");
    }

    // NOTE(kroot): fetch lyrics if requested
    if (showLyrics) {
      try {
        const lyrics = await getTrackLyrics(trackId);
        console.log("lyrics");

        if (lyrics.syncedLyrics && lyrics.syncedLyrics.length > 0) {
          for (const line of lyrics.syncedLyrics) {
            const mins = Math.floor(line.time / 60);
            const secs = (line.time % 60).toFixed(2);
            console.log(`[${mins}:${secs.padStart(5, "0")}] ${line.text}`);
          }
        } else if (lyrics.lyrics) {
          console.log(lyrics.lyrics);
        } else {
          console.log("no lyrics available");
        }
      } catch {
        console.log("lyrics: not available");
      }
    }
  } catch (error) {
    console.error("error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
