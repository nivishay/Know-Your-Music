// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

function makeTrack(overrides: Partial<{ id: string; name: string; preview_url: string | null; artistId: string; artistName: string }> = {}) {
  return {
    id: overrides.id ?? "track-1",
    name: overrides.name ?? "Song Title",
    preview_url: overrides.preview_url !== undefined ? overrides.preview_url : "https://preview.example.com/clip.mp3",
    artists: [{ id: overrides.artistId ?? "artist-1", name: overrides.artistName ?? "Artist Name" }],
    album: { release_date: "2024-01-01" },
  };
}

function makePlaylistResponse(tracks: ReturnType<typeof makeTrack>[]) {
  return {
    items: tracks.map((track) => ({ track })),
  };
}

describe("generateClips", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns exactly 5 clips, each with a previewUrl", async () => {
    const tracks = Array.from({ length: 10 }, (_, i) =>
      makeTrack({ id: `track-${i}`, name: `Song ${i}`, artistId: `artist-${i}`, artistName: `Artist ${i}` })
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(tracks),
    }));

    const { generateClips } = await import("./generateClips");
    const clips = await generateClips("test-token");

    expect(clips).toHaveLength(5);
    clips.forEach((clip) => {
      expect(clip.previewUrl).toBeTruthy();
    });
  });

  it("skips tracks that have no preview_url", async () => {
    const tracks = [
      makeTrack({ id: "no-preview-1", preview_url: null }),
      makeTrack({ id: "no-preview-2", preview_url: null }),
      ...Array.from({ length: 5 }, (_, i) =>
        makeTrack({ id: `track-${i}`, name: `Song ${i}`, artistId: `artist-${i}`, artistName: `Artist ${i}` })
      ),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(tracks),
    }));

    const { generateClips } = await import("./generateClips");
    const clips = await generateClips("test-token");

    expect(clips).toHaveLength(5);
    clips.forEach((clip) => {
      expect(clip.previewUrl).toBeTruthy();
    });
  });

  it("returns clips with trackId, songTitle, artistId, and artistName", async () => {
    const tracks = Array.from({ length: 5 }, (_, i) =>
      makeTrack({ id: `track-${i}`, name: `Song ${i}`, artistId: `artist-${i}`, artistName: `Artist ${i}` })
    );
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(tracks),
    }));

    const { generateClips } = await import("./generateClips");
    const clips = await generateClips("test-token");

    clips.forEach((clip) => {
      expect(clip.trackId).toMatch(/^track-\d+$/);
      expect(clip.songTitle).toBeTruthy();
      expect(clip.artistId).toMatch(/^artist-\d+$/);
      expect(clip.artistName).toBeTruthy();
    });
  });

  it("calls the Spotify playlist API with the provided token", async () => {
    const tracks = Array.from({ length: 5 }, (_, i) => makeTrack({ id: `track-${i}` }));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(tracks),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateClips } = await import("./generateClips");
    await generateClips("my-secret-token");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("api.spotify.com"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer my-secret-token" }),
      })
    );
  });
});
