import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AudioPlayer } from "./AudioPlayer";

describe("AudioPlayer", () => {
  it("renders a play button", () => {
    render(<AudioPlayer previewUrl="https://preview.example.com/clip.mp3" />);
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("does not render any song title text", () => {
    render(
      <AudioPlayer
        previewUrl="https://preview.example.com/clip.mp3"
        songTitle="Secret Song"
      />
    );
    expect(screen.queryByText("Secret Song")).not.toBeInTheDocument();
  });

  it("does not render any artist name text", () => {
    render(
      <AudioPlayer
        previewUrl="https://preview.example.com/clip.mp3"
        artistName="Secret Artist"
      />
    );
    expect(screen.queryByText("Secret Artist")).not.toBeInTheDocument();
  });

  it("resets to paused state when audio.play() is rejected by the browser", async () => {
    render(<AudioPlayer previewUrl="https://preview.example.com/clip.mp3" />);
    const button = screen.getByRole("button", { name: /play/i });

    // Simulate browser autoplay policy blocking play()
    HTMLMediaElement.prototype.play = vi.fn().mockRejectedValue(new DOMException("NotAllowedError"));
    HTMLMediaElement.prototype.pause = vi.fn();

    await act(async () => {
      fireEvent.click(button);
    });

    // Button should still show "Play" (not "Pause") since play was rejected
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("does not render an img element (no album art)", () => {
    const { container } = render(
      <AudioPlayer previewUrl="https://preview.example.com/clip.mp3" albumArtUrl="https://img.example.com/art.jpg" />
    );
    expect(container.querySelector("img")).toBeNull();
  });
});
