## What to build

**This is a validation spike — human decision required before building the Artist Quiz.**

Confirm that fetching tracks for a given artist via `GET /search?q={artist}&type=track` reliably returns at least 5 tracks with a `preview_url`.

Test with a range of artists: major artists, mid-tier, niche/indie. Document the hit rate and any edge cases (e.g. classical, podcasts showing up, regional artists).

## Acceptance criteria

- [ ] Tested against at least 10 different artists (mix of popular, mid-tier, niche)
- [ ] Document: what % of results have `preview_url`, average count per artist
- [ ] Identify any filtering needed (e.g. exclude non-music content from search results)
- [ ] Decision made: is the search approach viable, or do we need a different endpoint?
- [ ] Findings written up as a comment on this issue before #08 starts

## Blocked by

None — can run in parallel with other issues
