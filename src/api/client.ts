// NOTE(kroot): base api client for lane

export const BASE_URL = "https://api.sklane.com";
export const RU_BASE_URL = "https://ruapi.sklane.com";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string | null
  ) {
    super(`api error: ${code} - ${message}`);
    this.name = "ApiError";
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    statusText: string
  ) {
    super(`http error: ${status} ${statusText}`);
    this.name = "HttpError";
  }
}

// NOTE(kroot): auth token from env or manual set
let authToken: string | null = process.env.LANE_TOKEN ?? null;

export function setAuthToken(token: string): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

// NOTE(kroot): load token from .env file
export function loadEnvToken(): void {
  if (process.env.LANE_TOKEN) {
    authToken = process.env.LANE_TOKEN;
  }
}

// NOTE(kroot): build headers with optional auth
function buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "Lane/1.0 Android/meow :3",
    ...extraHeaders,
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

// NOTE(kroot): generic GET request
export async function apiGet<T>(
  endpoint: string,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: buildHeaders(extraHeaders),
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

// NOTE(kroot): generic POST request
export async function apiPost<T, B>(
  endpoint: string,
  body: B,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(extraHeaders),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

// NOTE(kroot): fetch raw stream/binary data
export async function apiGetStream(
  url: string,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const response = await fetch(url, {
    headers: buildHeaders(extraHeaders),
  });

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return response;
}

// NOTE(kroot): format duration to mm:ss
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// NOTE(kroot): format bytes to human-readable
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// NOTE(kroot): sanitize filename for saving
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
