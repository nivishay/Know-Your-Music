// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeTokenResponse(accessToken: string, expiresIn = 3600) {
  return { access_token: accessToken, expires_in: expiresIn };
}

describe("getSpotifyAppToken", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches a token from the Spotify token endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeTokenResponse("initial-token"),
    }));

    const { getSpotifyAppToken } = await import("./appToken");
    const token = await getSpotifyAppToken();

    expect(token).toBe("initial-token");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://accounts.spotify.com/api/token",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns cached token on second call without fetching again", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeTokenResponse("cached-token"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getSpotifyAppToken } = await import("./appToken");
    await getSpotifyAppToken();
    const token = await getSpotifyAppToken();

    expect(token).toBe("cached-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("re-fetches when cached token has expired", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => makeTokenResponse("first-token", 3600) })
      .mockResolvedValueOnce({ ok: true, json: async () => makeTokenResponse("refreshed-token", 3600) });
    vi.stubGlobal("fetch", fetchMock);

    const { getSpotifyAppToken } = await import("./appToken");
    await getSpotifyAppToken(); // fetches first token

    // Advance time past expiry (3600s + buffer)
    vi.advanceTimersByTime(3700 * 1000);

    const token = await getSpotifyAppToken();

    expect(token).toBe("refreshed-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("sends client credentials in the request body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeTokenResponse("token"),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getSpotifyAppToken } = await import("./appToken");
    await getSpotifyAppToken();

    const [, options] = fetchMock.mock.calls[0];
    const body = new URLSearchParams(options.body as string);
    expect(body.get("grant_type")).toBe("client_credentials");
  });
});
