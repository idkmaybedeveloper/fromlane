// NOTE(kroot): cli for downloading tracks

import "../env";
import * as fs from "node:fs";
import * as path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

import {
  getTrackStream,
  getTrackDownload,
  search,
  apiGetStream,
  formatDuration,
  formatFileSize,
  sanitizeFilename,
  loadEnvToken,
} from "../api";

loadEnvToken();

const DOWNLOADS_DIR = "./downloads";

async function downloadTrack(trackId: string, artist: string, title: string): Promise<void> {
  console.log(`\nfetching stream url for: ${artist} - ${title}`);

  // NOTE(kroot): try download endpoint first, fallback to stream
  let streamResult;
  try {
    streamResult = await getTrackDownload(trackId, "high");
  } catch {
    console.log("download endpoint failed, trying stream...");
    streamResult = await getTrackStream(trackId, { quality: "high" });
  }

  console.log(`quality: ${streamResult.quality}`);
  console.log(`format: ${streamResult.format}`);
  console.log(`url: ${streamResult.url.substring(0, 80)}...`);

  // NOTE(kroot): create downloads directory if needed
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }

  // NOTE(kroot): determine file extension
  const ext = streamResult.format === "mp3" ? ".mp3" : ".m4a";
  const filename = sanitizeFilename(`${artist} - ${title}${ext}`);
  const filepath = path.join(DOWNLOADS_DIR, filename);

  console.log(`\ndownloading to: ${filepath}`);

  // NOTE(kroot): download the file
  const response = await apiGetStream(streamResult.url);
  const contentLength = response.headers.get("content-length");

  if (contentLength) {
    console.log(`size: ${formatFileSize(parseInt(contentLength, 10))}`);
  }

  // NOTE(kroot): pipe stream to file
  const fileStream = fs.createWriteStream(filepath);
  const body = response.body;

  if (!body) {
    throw new Error("response body is null");
  }

  await pipeline(Readable.fromWeb(body as never), fileStream);

  console.log(`\ndone: ${filepath}`);
}

async function main() {
  const input = process.argv[2];

  if (!input) {
    console.log("usage: pnpm download <track_id | search_query>");
    console.log("examples:");
    console.log("pnpm download abc123xyz");
    console.log("pnpm download \"кино группа крови\"");
    process.exit(1);
  }

  try {
    // NOTE(kroot): check if input looks like a track id or search query
    const isTrackId = /^[a-zA-Z0-9_-]{10,}$/.test(input);

    if (isTrackId) {
      // NOTE(kroot): direct download by track id
      await downloadTrack(input, "Unknown", input);
    } else {
      // NOTE(kroot): search and download first result
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

      // NOTE(kroot): download first track
      const track = results.tracks[0];
      console.log(`\ndownloading first result...`);
      await downloadTrack(track.id, track.artist, track.title);
    }
  } catch (error) {
    console.error("error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
