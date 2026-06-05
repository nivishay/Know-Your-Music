import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModeCard } from "./ModeCard";

describe("ModeCard", () => {
  it("renders the mode title", () => {
    render(<ModeCard title="Charts" description="Top tracks quiz" onClick={() => {}} />);
    expect(screen.getByText("Charts")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ModeCard title="Charts" description="Top tracks quiz" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
