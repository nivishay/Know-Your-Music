// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: mockGet,
    set: mockSet,
    delete: mockDelete,
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { refresh_token: "encrypted-token" },
          }),
        })),
      })),
    })),
  })),
}));

vi.mock("@/lib/crypto", () => ({
  decrypt: vi.fn().mockReturnValue("raw-refresh-token"),
}));

vi.mock("@/services/auth/spotify", () => ({
  refreshAccessToken: vi.fn().mockResolvedValue({
    access_token: "new-access-token",
    expires_in: 3600,
  }),
}));

vi.mock("@/lib/env", () => ({
  env: {
    encryption: { secret: "test-secret" },
  },
}));

describe("getValidAccessToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns access token from cookie when present", async () => {
    mockGet.mockImplementation((name: string) =>
      name === "spotify_access_token" ? { value: "cached-token" } : undefined
    );
    const { getValidAccessToken } = await import("./getValidAccessToken");
    expect(await getValidAccessToken()).toBe("cached-token");
  });

  it("returns null when no access token and no user id cookie", async () => {
    mockGet.mockReturnValue(undefined);
    const { getValidAccessToken } = await import("./getValidAccessToken");
    expect(await getValidAccessToken()).toBeNull();
  });

  it("refreshes and returns new token when access token cookie is missing but user id exists", async () => {
    mockGet.mockImplementation((name: string) =>
      name === "spotify_user_id" ? { value: "user-123" } : undefined
    );
    const { getValidAccessToken } = await import("./getValidAccessToken");
    expect(await getValidAccessToken()).toBe("new-access-token");
  });

  it("still returns refreshed token even when cookieStore.set throws (Server Component context)", async () => {
    mockGet.mockImplementation((name: string) =>
      name === "spotify_user_id" ? { value: "user-123" } : undefined
    );
    mockSet.mockImplementation(() => {
      throw new Error("Cookies can only be modified in a Server Action or Route Handler");
    });
    const { getValidAccessToken } = await import("./getValidAccessToken");
    expect(await getValidAccessToken()).toBe("new-access-token");
  });
});
