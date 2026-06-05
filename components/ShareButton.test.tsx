import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShareButton } from "./ShareButton";

describe("ShareButton", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });
    Object.defineProperty(window, "location", {
      value: { origin: "https://example.com" },
      writable: true,
    });
  });

  it("renders a Share button", () => {
    render(<ShareButton />);
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("copies the /daily URL to clipboard on click", async () => {
    render(<ShareButton />);
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://example.com/daily");
  });
});
