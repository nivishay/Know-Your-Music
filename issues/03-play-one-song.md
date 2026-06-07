## What to build

From the fetched liked songs pool, pick one track that has a `preview_url` and show it with a working play button. The player must show no identifying info — no song title, no artist name, no album art. Just a play/pause button.

Clicking play streams the 30-second Spotify preview clip. Replays are unlimited.

This slice proves the audio pipeline works before any quiz logic is added.

## Acceptance criteria

- [ ] One track with a `preview_url` is selected from the liked songs pool
- [ ] A play/pause button is shown — no song title, artist, or album art visible
- [ ] Clicking play streams the 30-second preview clip
- [ ] Replay works (click play again after it ends)
- [ ] If no tracks have a `preview_url`, an error message is shown

## Blocked by

- #02 Spotify API smoke test
