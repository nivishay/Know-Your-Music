// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

function makePlaylistItem(artistName: string, songTitle: string, id?: string) {
  return {
    track: {
      id: id ?? `track-${Math.random()}`,
      name: songTitle,
      artists: [{ name: artistName }],
    },
  };
}

function makePlaylistResponse(items: ReturnType<typeof makePlaylistItem>[]) {
  return { items };
}

describe("generateDistractors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns 3 unique wrong artist names (none matching correct artist)", async () => {
    const items = [
      makePlaylistItem("Wrong Artist A", "Song A"),
      makePlaylistItem("Wrong Artist B", "Song B"),
      makePlaylistItem("Wrong Artist C", "Song C"),
      makePlaylistItem("Correct Artist", "Song D"), // should be excluded
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result.artistDistractors).toHaveLength(3);
    expect(result.artistDistractors).not.toContain("Correct Artist");
  });

  it("returns 3 song title distractors", async () => {
    const items = [
      makePlaylistItem("Artist A", "Wrong Song A"),
      makePlaylistItem("Artist B", "Wrong Song B"),
      makePlaylistItem("Artist C", "Wrong Song C"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result.songDistractors).toHaveLength(3);
  });

  it("picks up enough distractors from a larger playlist in one call", async () => {
    const items = [
      makePlaylistItem("Wrong Artist A", "Song A"),
      makePlaylistItem("Wrong Artist B", "Song B"),
      makePlaylistItem("Correct Artist", "Song C"),  // excluded
      makePlaylistItem("Wrong Artist C", "Song D"),
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result.artistDistractors).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws DistractorError when playlist has insufficient unique wrong artists", async () => {
    const items = [
      makePlaylistItem("Wrong Artist A", "Song A"),
      makePlaylistItem("Correct Artist", "Song B"),
    ];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateDistractors } = await import("./generateDistractors");
    await expect(
      generateDistractors("test-token", "seed-track-id", "Correct Artist")
    ).rejects.toMatchObject({ name: "DistractorError" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never includes the correct song title in songDistractors", async () => {
    const items = [
      makePlaylistItem("Artist A", "Correct Song"), // should be excluded
      makePlaylistItem("Artist B", "Wrong Song B"),
      makePlaylistItem("Artist C", "Wrong Song C"),
      makePlaylistItem("Artist D", "Wrong Song D"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist", "Correct Song");

    expect(result.songDistractors).not.toContain("Correct Song");
  });

  it("throws DistractorError when Spotify returns a non-200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { status: 429, message: "rate limited" } }),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    await expect(
      generateDistractors("test-token", "seed-track-id", "Correct Artist", "Correct Song")
    ).rejects.toMatchObject({ name: "DistractorError" });
  });

  it("deduplicates artists across playlist items", async () => {
    const items = [
      makePlaylistItem("Wrong Artist A", "Song A"),
      makePlaylistItem("Wrong Artist A", "Song B"), // duplicate
      makePlaylistItem("Wrong Artist B", "Song C"),
      makePlaylistItem("Wrong Artist C", "Song D"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    const unique = new Set(result.artistDistractors);
    expect(unique.size).toBe(result.artistDistractors.length);
  });

  it("skips the seed track itself when building distractors", async () => {
    const items = [
      makePlaylistItem("Seed Artist", "Seed Song", "seed-track-id"), // same track — excluded
      makePlaylistItem("Wrong Artist A", "Song A"),
      makePlaylistItem("Wrong Artist B", "Song B"),
      makePlaylistItem("Wrong Artist C", "Song C"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makePlaylistResponse(items),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Different Artist");

    expect(result.artistDistractors).not.toContain("Seed Artist");
  });
});
