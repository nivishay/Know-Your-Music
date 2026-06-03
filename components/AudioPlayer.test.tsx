import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("does not render an img element (no album art)", () => {
    const { container } = render(
      <AudioPlayer previewUrl="https://preview.example.com/clip.mp3" albumArtUrl="https://img.example.com/art.jpg" />
    );
    expect(container.querySelector("img")).toBeNull();
  });
});
