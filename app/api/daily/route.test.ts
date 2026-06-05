// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const MOCK_CLIP = {
  trackId: "track-daily",
  previewUrl: "https://preview.example.com/daily.mp3",
  songQuestion: { correct: "Daily Song", options: ["Daily Song", "A", "B", "C"] },
  artistQuestion: { correct: "Daily Artist", options: ["Daily Artist", "X", "Y", "Z"] },
};

const mockCreateDailySession = vi.fn();
vi.mock("@/services/daily/createDailySession", () => ({
  createDailySession: mockCreateDailySession,
  DailySessionError: class DailySessionError extends Error {},
}));

const mockGetValidAccessToken = vi.fn();
vi.mock("@/lib/auth/getValidAccessToken", () => ({
  getValidAccessToken: mockGetValidAccessToken,
}));

const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockUpdateEq = vi.fn();
const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({ select: mockSelect, update: mockUpdate }),
  }),
}));

const mockCookiesGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: mockCookiesGet }),
}));

describe("GET /api/daily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValidAccessToken.mockResolvedValue("test-spotify-token");
    mockCreateDailySession.mockResolvedValue({
      sessionId: "daily-session-id",
      clips: [MOCK_CLIP],
    });
    mockCookiesGet.mockReturnValue(undefined);
    mockSingle.mockResolvedValue({ data: null });
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockGetValidAccessToken.mockResolvedValue(null);
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/daily");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns a sessionId and 1 clip for authenticated user", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/daily");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.sessionId).toBe("daily-session-id");
    expect(data.clips).toHaveLength(1);
  });

  it("passes the user token to createDailySession", async () => {
    const { GET } = await import("./route");
    await GET(new NextRequest("http://localhost/api/daily"));
    expect(mockCreateDailySession).toHaveBeenCalledWith("test-spotify-token");
  });

  it("returns 403 when authenticated user already played today", async () => {
    const today = new Date().toISOString().split("T")[0];
    mockCookiesGet.mockImplementation((key: string) =>
      key === "spotify_user_id" ? { value: "user-123" } : undefined
    );
    mockSingle.mockResolvedValue({ data: { last_daily_played: today } });

    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/daily");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.blocked).toBe(true);
  });

  it("returns a session when authenticated user has not played today", async () => {
    mockCookiesGet.mockImplementation((key: string) =>
      key === "spotify_user_id" ? { value: "user-123" } : undefined
    );
    mockSingle.mockResolvedValue({ data: { last_daily_played: "2020-01-01" } });

    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost/api/daily");
    const res = await GET(req);

    expect(res.status).toBe(200);
  });
});

describe("POST /api/daily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesGet.mockReturnValue(undefined);
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  it("returns 401 when not authenticated", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/daily", { method: "POST" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("marks last_daily_played and returns ok for authenticated user", async () => {
    mockCookiesGet.mockImplementation((key: string) =>
      key === "spotify_user_id" ? { value: "user-123" } : undefined
    );

    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/daily", { method: "POST" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ last_daily_played: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) })
    );
  });
});
