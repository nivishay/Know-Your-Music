// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockTracks = Array.from({ length: 50 }, (_, i) => ({
  track: {
    id: `track-${i}`,
    name: `Song ${i}`,
    preview_url: `https://preview.example.com/${i}.mp3`,
    artists: [{ id: `artist-${i}`, name: `Artist ${i}` }],
  },
}));

describe("getDailyTrack", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: mockTracks }),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("returns a track with expected shape", async () => {
    const { getDailyTrack } = await import("./getDailyTrack");
    const track = await getDailyTrack("test-token");
    expect(track).toMatchObject({
      trackId: expect.any(String),
      previewUrl: expect.any(String),
      songTitle: expect.any(String),
      artistName: expect.any(String),
      artistId: expect.any(String),
    });
  });

  it("returns the same track when called twice on the same day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00"));
    const { getDailyTrack } = await import("./getDailyTrack");
    const track1 = await getDailyTrack("test-token");
    const track2 = await getDailyTrack("test-token");
    expect(track1.trackId).toBe(track2.trackId);
  });

  it("returns a different track on a different day", async () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2024-01-01T12:00:00"));
    const { getDailyTrack: getTrack } = await import("./getDailyTrack");
    const track1 = await getTrack("test-token");

    vi.setSystemTime(new Date("2024-01-02T12:00:00"));
    const track2 = await getTrack("test-token");

    expect(track1.trackId).not.toBe(track2.trackId);
  });
});
