// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const MOCK_TRACKS = Array.from({ length: 5 }, (_, i) => ({
  trackId: `track-${i}`,
  previewUrl: `https://preview.example.com/${i}.mp3`,
  songTitle: `Song ${i}`,
  artistId: `artist-${i}`,
  artistName: `Artist ${i}`,
}));

const MOCK_DISTRACTORS = {
  artistDistractors: ["Wrong A", "Wrong B", "Wrong C"],
  songDistractors: ["Wrong Song A", "Wrong Song B", "Wrong Song C"],
};

vi.mock("@/services/spotify/appToken", () => ({
  getSpotifyAppToken: vi.fn().mockResolvedValue("test-app-token"),
}));

vi.mock("@/services/quiz/generateClips", () => ({
  generateClips: vi.fn().mockResolvedValue(MOCK_TRACKS),
}));

vi.mock("@/services/quiz/generateDistractors", () => ({
  generateDistractors: vi.fn().mockResolvedValue(MOCK_DISTRACTORS),
}));

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
}));

describe("POST /api/quiz/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  async function postSession(body: object) {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/quiz/session", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    return POST(req);
  }

  it("returns 5 clips each with exactly 4 answer options for charts mode", async () => {
    const res = await postSession({ mode: "charts" });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.clips).toHaveLength(5);
    data.clips.forEach((clip: { songQuestion: { options: string[] }; artistQuestion: { options: string[] } }) => {
      expect(clip.songQuestion.options).toHaveLength(4);
      expect(clip.artistQuestion.options).toHaveLength(4);
    });
  });

  it("never includes the correct answer in the distractor list", async () => {
    const res = await postSession({ mode: "charts" });
    const data = await res.json();

    data.clips.forEach(
      (
        clip: {
          songQuestion: { correct: string; options: string[] };
          artistQuestion: { correct: string; options: string[] };
        },
        i: number
      ) => {
        const wrongSongs = clip.songQuestion.options.filter((o) => o !== clip.songQuestion.correct);
        expect(wrongSongs).not.toContain(clip.songQuestion.correct);

        const wrongArtists = clip.artistQuestion.options.filter((o) => o !== clip.artistQuestion.correct);
        expect(wrongArtists).not.toContain(clip.artistQuestion.correct);

        // Correct answer IS in options exactly once
        expect(clip.songQuestion.options.filter((o) => o === MOCK_TRACKS[i].songTitle)).toHaveLength(1);
        expect(clip.artistQuestion.options.filter((o) => o === MOCK_TRACKS[i].artistName)).toHaveLength(1);
      }
    );
  });

  it("inserts a quiz_sessions row in the DB", async () => {
    await postSession({ mode: "charts" });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "general",
        format: "round",
      })
    );
  });

  it("returns a sessionId in the response", async () => {
    const res = await postSession({ mode: "charts" });
    const data = await res.json();

    expect(data.sessionId).toBeTruthy();
    expect(typeof data.sessionId).toBe("string");
  });

  it("returns 400 for invalid mode", async () => {
    const res = await postSession({ mode: "invalid" });
    expect(res.status).toBe(400);
  });
});
