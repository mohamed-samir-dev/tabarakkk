import { NextRequest } from "next/server";

const ALLOWED_BACKENDS = [
  "https://tabaraktech.com/api/tabarak",
  "https://api2.tabaraktech.com",
  "https://api2.tabaraktech.com/api",
];

const DEFAULT_BACKEND = "https://api2.tabaraktech.com";

export function getBackend(): string {
  const url = process.env.BACKEND_URL || DEFAULT_BACKEND;
  return ALLOWED_BACKENDS.includes(url) ? url : DEFAULT_BACKEND;
}

export function forwardCookies(req: NextRequest, init: RequestInit): RequestInit {
  const cookie = req.headers.get("cookie") || "";
  return { ...init, headers: { ...(init.headers as Record<string, string>), cookie } };
}
