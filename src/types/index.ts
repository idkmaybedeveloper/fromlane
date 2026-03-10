// NOTE(kroot): lane api type definitions

export interface TrackData {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  coverUrl: string;
  platform: string;
  explicit: boolean;
}

export interface TrackStreamingResult {
  url: string;
  quality: string;
  format: string;
  expiresAt: number;
}

export interface TrackStats {
  plays: number;
  likes: number;
  comments: number;
}

export interface TrackLyrics {
  trackId: string;
  lyrics: string;
  syncedLyrics: LyricLine[] | null;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface LaneArtistItem {
  id: string;
  name: string;
  imageUrl: string;
  monthlyListeners: number;
  verified: boolean;
}

export interface LaneAlbumItem {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseDate: string;
  trackCount: number;
  tracks: TrackData[];
}

export interface LanePlaylistItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  isPublic: boolean;
  ownerId: string;
  ownerName: string;
  tracks: TrackData[];
}

export interface SearchResult {
  tracks: TrackData[];
  artists: LaneArtistItem[];
  albums: LaneAlbumItem[];
  playlists: LanePlaylistItem[];
}

export interface LaneCombinedSearchResponse {
  tracks: TrackData[];
  artists: LaneArtistItem[];
  albums: LaneAlbumItem[];
  playlists: LanePlaylistItem[];
  query: string;
}

export interface SmartHintsResponse {
  hints: SearchHint[];
}

export interface SearchHint {
  text: string;
  type: "track" | "artist" | "album" | "query";
  id: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SearchOptions {
  platform?: string;
  version?: string;
}

export interface StreamOptions {
  quality?: "low" | "medium" | "high" | "lossless";
  refId?: string;
}
