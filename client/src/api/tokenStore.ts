// Access tokens live in memory only (never localStorage) — the httpOnly
// refresh cookie is what survives a page reload; see AuthContext's bootstrap.
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
};
