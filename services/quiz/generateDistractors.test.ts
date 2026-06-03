// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

function makeRecommendation(artistName: string, songTitle: string) {
  return {
    id: `track-${Math.random()}`,
    name: songTitle,
    artists: [{ id: `artist-${Math.random()}`, name: artistName }],
  };
}

function makeRecommendationsResponse(tracks: ReturnType<typeof makeRecommendation>[]) {
  return { tracks };
}

describe("generateDistractors", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns 3 unique wrong artist names (none matching correct artist)", async () => {
    const recommendations = [
      makeRecommendation("Wrong Artist A", "Song A"),
      makeRecommendation("Wrong Artist B", "Song B"),
      makeRecommendation("Wrong Artist C", "Song C"),
      makeRecommendation("Correct Artist", "Song D"), // should be excluded
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeRecommendationsResponse(recommendations),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result).not.toBeNull();
    expect(result!.artistDistractors).toHaveLength(3);
    expect(result!.artistDistractors).not.toContain("Correct Artist");
  });

  it("returns 3 song title distractors", async () => {
    const recommendations = [
      makeRecommendation("Artist A", "Wrong Song A"),
      makeRecommendation("Artist B", "Wrong Song B"),
      makeRecommendation("Artist C", "Wrong Song C"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeRecommendationsResponse(recommendations),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result).not.toBeNull();
    expect(result!.songDistractors).toHaveLength(3);
  });

  it("retries once if first call yields fewer than 3 unique wrong artists", async () => {
    // First call: only 2 unique wrong artists
    const firstResponse = makeRecommendationsResponse([
      makeRecommendation("Wrong Artist A", "Song A"),
      makeRecommendation("Wrong Artist B", "Song B"),
      makeRecommendation("Correct Artist", "Song C"),
    ]);
    // Second call: 3 unique wrong artists
    const secondResponse = makeRecommendationsResponse([
      makeRecommendation("Wrong Artist A", "Song A"),
      makeRecommendation("Wrong Artist B", "Song B"),
      makeRecommendation("Wrong Artist C", "Song C"),
    ]);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => firstResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => secondResponse });
    vi.stubGlobal("fetch", fetchMock);

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result).not.toBeNull();
    expect(result!.artistDistractors).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns null after 2 retries still insufficient", async () => {
    // All calls return fewer than 3 unique wrong artists
    const insufficientResponse = makeRecommendationsResponse([
      makeRecommendation("Wrong Artist A", "Song A"),
      makeRecommendation("Correct Artist", "Song B"),
    ]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => insufficientResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("never includes the correct song title in songDistractors", async () => {
    const recommendations = [
      makeRecommendation("Artist A", "Correct Song"), // same title as correct — should be excluded
      makeRecommendation("Artist B", "Wrong Song B"),
      makeRecommendation("Artist C", "Wrong Song C"),
      makeRecommendation("Artist D", "Wrong Song D"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeRecommendationsResponse(recommendations),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist", "Correct Song");

    expect(result).not.toBeNull();
    expect(result!.songDistractors).not.toContain("Correct Song");
  });

  it("returns null when Spotify returns a non-200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { status: 429, message: "rate limited" } }),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist", "Correct Song");

    expect(result).toBeNull();
  });

  it("deduplicates artists across recommendations", async () => {
    const recommendations = [
      makeRecommendation("Wrong Artist A", "Song A"),
      makeRecommendation("Wrong Artist A", "Song B"), // duplicate
      makeRecommendation("Wrong Artist B", "Song C"),
      makeRecommendation("Wrong Artist C", "Song D"),
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => makeRecommendationsResponse(recommendations),
    }));

    const { generateDistractors } = await import("./generateDistractors");
    const result = await generateDistractors("test-token", "seed-track-id", "Correct Artist");

    expect(result).not.toBeNull();
    const unique = new Set(result!.artistDistractors);
    expect(unique.size).toBe(result!.artistDistractors.length);
  });
});
