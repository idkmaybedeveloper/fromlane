// NOTE(kroot): search-related api functions

import type {
  LaneCombinedSearchResponse,
  SmartHintsResponse,
  LaneArtistItem,
  LaneAlbumItem,
  LanePlaylistItem,
  SearchOptions,
} from "../types";
import { apiGet } from "./client";

// NOTE(kroot): default search version
const DEFAULT_VERSION = "2";
const DEFAULT_PLATFORM = "android";

// NOTE(kroot): search tracks, artists, albums, playlists
export async function search(
  query: string,
  options?: SearchOptions
): Promise<LaneCombinedSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    platform: options?.platform ?? DEFAULT_PLATFORM,
    ver: options?.version ?? DEFAULT_VERSION,
  });

  return apiGet<LaneCombinedSearchResponse>(`/platforms/search?${params.toString()}`);
}

// NOTE(kroot): get search hints (autocomplete)
export async function getSearchHints(query: string): Promise<SmartHintsResponse> {
  return apiGet<SmartHintsResponse>(
    `/platforms/v2/hints?q=${encodeURIComponent(query)}`
  );
}

// NOTE(kroot): get artist info
export async function getArtist(artistId: string): Promise<LaneArtistItem> {
  return apiGet<LaneArtistItem>(
    `/platforms/artist?artistId=${encodeURIComponent(artistId)}`
  );
}

// NOTE(kroot): get album info
export async function getAlbum(albumId: string): Promise<LaneAlbumItem> {
  return apiGet<LaneAlbumItem>(
    `/platforms/album?albumId=${encodeURIComponent(albumId)}`
  );
}

// NOTE(kroot): get playlist info
export async function getPlaylist(
  playlistId: string,
  platform?: string
): Promise<LanePlaylistItem> {
  const params = new URLSearchParams({ playlistId });
  if (platform) {
    params.set("platform", platform);
  }

  return apiGet<LanePlaylistItem>(`/playlist/${encodeURIComponent(playlistId)}`);
}

// NOTE(kroot): get track recommendations
export async function getRecommendations(
  trackId: string,
  platform: string = DEFAULT_PLATFORM
): Promise<LanePlaylistItem> {
  const params = new URLSearchParams({
    trackId,
    platform,
  });

  return apiGet<LanePlaylistItem>(`/platforms/recommendations?${params.toString()}`);
}
