import { env } from "./env";

// API_URL is like http://localhost:4000/api/v1; static uploads are served
// from the server root, so strip the /api/v1 suffix.
const SERVER_ORIGIN = env.API_URL.replace(/\/api\/v1\/?$/, "");

export const getFileUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${SERVER_ORIGIN}${path}`;
};
