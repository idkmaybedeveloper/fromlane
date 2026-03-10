// NOTE(kroot): track-related api functions

import type {
  TrackData,
  TrackStreamingResult,
  TrackStats,
  TrackLyrics,
  StreamOptions,
} from "../types";
import { apiGet, apiPost } from "./client";

// NOTE(kroot): get track stream url
export async function getTrackStream(
  trackId: string,
  options?: StreamOptions
): Promise<TrackStreamingResult> {
  const params = new URLSearchParams({ trackId });

  if (options?.quality) {
    params.set("streamQuality", options.quality);
  }
  if (options?.refId) {
    params.set("refId", options.refId);
  }

  return apiGet<TrackStreamingResult>(`/track/stream?${params.toString()}`);
}

// NOTE(kroot): get track download url (streaming response)
export async function getTrackDownload(
  trackId: string,
  quality?: string
): Promise<TrackStreamingResult> {
  const params = new URLSearchParams({ trackId });

  if (quality) {
    params.set("streamQuality", quality);
  }

  return apiGet<TrackStreamingResult>(`/track/download?${params.toString()}`);
}

// NOTE(kroot): get track statistics
export async function getTrackStats(trackId: string): Promise<TrackStats> {
  return apiGet<TrackStats>(`/track/stats?trackId=${encodeURIComponent(trackId)}`);
}

// NOTE(kroot): get track lyrics
export async function getTrackLyrics(trackId: string): Promise<TrackLyrics> {
  return apiGet<TrackLyrics>(`/track/${encodeURIComponent(trackId)}/lyrics`);
}

// NOTE(kroot): get multiple tracks by ids
export async function getTracks(
  trackIds: string[],
  prefetch: string = "false"
): Promise<TrackData[]> {
  return apiPost<TrackData[], { ids: string[] }>(
    `/user/tracks?prefetch=${prefetch}`,
    { ids: trackIds }
  );
}

// NOTE(kroot): apply audio effect to track
export async function getTrackWithEffect(
  trackId: string,
  effect: string
): Promise<TrackStreamingResult> {
  const params = new URLSearchParams({
    trackId,
    effect,
  });

  return apiGet<TrackStreamingResult>(`/track/effect?${params.toString()}`);
}

// NOTE(kroot): log track playback
export async function logTrackPlay(token: string): Promise<void> {
  await apiPost<unknown, undefined>(
    `/track/log?token=${encodeURIComponent(token)}`,
    undefined
  );
}
