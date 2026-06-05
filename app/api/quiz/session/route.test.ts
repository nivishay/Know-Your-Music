// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockImplementation((name: string) =>
      name === "spotify_access_token" ? { value: "test-token" } : undefined
    ),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

const MOCK_CLIPS = Array.from({ length: 5 }, (_, i) => ({
  trackId: `track-${i}`,
  previewUrl: `https://preview.example.com/${i}.mp3`,
  songQuestion: {
    correct: `Song ${i}`,
    options: [`Song ${i}`, "Wrong Song A", "Wrong Song B", "Wrong Song C"],
  },
  artistQuestion: {
    correct: `Artist ${i}`,
    options: [`Artist ${i}`, "Wrong A", "Wrong B", "Wrong C"],
  },
}));

const mockCreateSession = vi.fn().mockResolvedValue({
  sessionId: "mock-session-id",
  clips: MOCK_CLIPS,
});

vi.mock("@/services/quiz/createSession", () => ({
  createSession: mockCreateSession,
  SessionError: class SessionError extends Error {},
}));

describe("POST /api/quiz/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSession.mockResolvedValue({ sessionId: "mock-session-id", clips: MOCK_CLIPS });
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

  it("returns 5 clips each with exactly 4 answer options for charts flavor", async () => {
    const res = await postSession({ flavor: "charts" });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.clips).toHaveLength(5);
    data.clips.forEach((clip: { songQuestion: { options: string[] }; artistQuestion: { options: string[] } }) => {
      expect(clip.songQuestion.options).toHaveLength(4);
      expect(clip.artistQuestion.options).toHaveLength(4);
    });
  });

  it("returns a sessionId in the response", async () => {
    const res = await postSession({ flavor: "charts" });
    const data = await res.json();

    expect(data.sessionId).toBeTruthy();
    expect(typeof data.sessionId).toBe("string");
  });

  it("calls createSession with the flavor and round format", async () => {
    await postSession({ flavor: "charts" });

    expect(mockCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({ flavor: "charts", format: "round" })
    );
  });

  it("returns 400 for an invalid flavor", async () => {
    const res = await postSession({ flavor: "invalid" });
    expect(res.status).toBe(400);
  });

  it("returns 500 when createSession throws", async () => {
    const { SessionError } = await import("@/services/quiz/createSession");
    mockCreateSession.mockRejectedValue(new SessionError("Could not build any quiz clips"));

    const res = await postSession({ flavor: "charts" });
    expect(res.status).toBe(500);
  });
});
