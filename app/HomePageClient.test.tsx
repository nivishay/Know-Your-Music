import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { HomePageClient } from "./HomePageClient";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

const DAILY_SESSION_ID = "daily-session-abc";

function renderGuest() {
  return render(<HomePageClient isAuthenticated={false} dailySessionId={DAILY_SESSION_ID} />);
}

function renderAuth() {
  return render(<HomePageClient isAuthenticated={true} dailySessionId={DAILY_SESSION_ID} />);
}

describe("HomePageClient", () => {
  beforeEach(() => {
    mockPush.mockClear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sessionId: "test-session-id" }),
    });
    localStorage.clear();
  });

  it("shows a Today's Challenge hero label for guests", () => {
    renderGuest();
    expect(screen.getByText(/today's challenge/i)).toBeInTheDocument();
  });

  it("hero play button links to the daily quiz session", () => {
    renderGuest();
    const playLink = screen.getByRole("link", { name: /play/i });
    expect(playLink).toHaveAttribute("href", `/quiz/${DAILY_SESSION_ID}`);
  });

  it("hero play button falls back to /daily when no session id", () => {
    render(<HomePageClient isAuthenticated={false} dailySessionId={null} />);
    const playLink = screen.getByRole("link", { name: /play/i });
    expect(playLink).toHaveAttribute("href", "/daily");
  });

  it("Daily Challenge is not shown as a mode card for guests", () => {
    renderGuest();
    const buttons = screen.getAllByRole("button");
    const titles = buttons.map((b) => b.textContent);
    expect(titles.some((t) => t?.includes("Daily Challenge"))).toBe(false);
  });

  it("shows Charts, Genre, Artist, and Streak mode cards for guests", () => {
    renderGuest();
    expect(screen.getByRole("button", { name: /charts/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /genre/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /artist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /streak/i })).toBeInTheDocument();
  });

  it("shows Spotify connect CTA for guests", () => {
    renderGuest();
    expect(screen.getByRole("link", { name: /connect spotify/i })).toBeInTheDocument();
  });

  it("hides Spotify connect CTA for authenticated users", () => {
    renderAuth();
    expect(screen.queryByRole("link", { name: /connect spotify/i })).not.toBeInTheDocument();
  });

  it("renders a General | Personal toggle for authenticated users", () => {
    renderAuth();
    expect(screen.getByRole("tab", { name: /general/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /personal/i })).toBeInTheDocument();
  });

  it("toggle defaults to Personal", () => {
    renderAuth();
    const personalTab = screen.getByRole("tab", { name: /personal/i });
    expect(personalTab).toHaveAttribute("aria-selected", "true");
  });

  it("Personal mode shows Artist, Streak, and Daily Challenge cards", () => {
    renderAuth();
    // in default Personal mode
    expect(screen.getByRole("button", { name: /artist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /streak/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /daily challenge/i })).toBeInTheDocument();
  });

  it("General mode shows Charts, Genre, Artist, Streak, and Daily Challenge", () => {
    renderAuth();
    fireEvent.click(screen.getByRole("tab", { name: /general/i }));
    expect(screen.getByRole("button", { name: /charts/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /genre/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /artist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /streak/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /daily challenge/i })).toBeInTheDocument();
  });

  it("Daily Challenge card shows 'General' badge in Personal mode", () => {
    renderAuth();
    // default is Personal
    const dailyBtn = screen.getByRole("button", { name: /daily challenge/i });
    expect(within(dailyBtn).getByText("General")).toBeInTheDocument();
  });

  it("Daily Challenge card does NOT show 'General' badge in General mode", () => {
    renderAuth();
    fireEvent.click(screen.getByRole("tab", { name: /general/i }));
    const dailyBtn = screen.getByRole("button", { name: /daily challenge/i });
    expect(within(dailyBtn).queryByText("General")).not.toBeInTheDocument();
  });

  it("restores toggle state from localStorage on mount", () => {
    localStorage.setItem("kym_mode", "general");
    renderAuth();
    expect(screen.getByRole("tab", { name: /general/i })).toHaveAttribute("aria-selected", "true");
    localStorage.removeItem("kym_mode");
  });

  it("persists toggle selection to localStorage", () => {
    renderAuth();
    fireEvent.click(screen.getByRole("tab", { name: /general/i }));
    expect(localStorage.getItem("kym_mode")).toBe("general");
  });

  it("does not navigate when session API returns an error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Authentication required" }),
    });
    renderGuest();
    fireEvent.click(screen.getByRole("button", { name: /charts/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining("undefined"));
    expect(mockPush).not.toHaveBeenCalled();
  });
});
