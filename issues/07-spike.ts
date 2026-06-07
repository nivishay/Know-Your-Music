/**
 * Issue #07 — Artist Quiz Search Spike
 *
 * HOW TO RUN
 * ----------
 *   PowerShell — source env vars first:
 *     Get-Content .env.local | ForEach-Object {
 *       if ($_ -match '^([^#=]+)=(.*)$') { $env:($matches[1]) = $matches[2] }
 *     }
 *     npx --yes tsx --tsconfig tsconfig.json issues/07-spike.ts
 *
 *   bash / Git Bash:
 *     export $(grep -v '^#' .env.local | xargs)
 *     npx --yes tsx --tsconfig tsconfig.json issues/07-spike.ts
 */

interface SpotifyTokenResponse {
  access_token: string; token_type: string; expires_in: number
}
interface SpotifySearchTrack {
  id: string; name: string; type: string
  artists: Array<{ name: string }>
  preview_url: string | null
  album: { name: string }
  is_local?: boolean
}
interface SpotifySearchResponse {
  tracks?: { href: string; total: number; items: SpotifySearchTrack[] }
}

const TEST_ARTISTS = [
  'Taylor Swift', 'Drake', 'The Beatles', 'Radiohead', 'Tame Impala',
  'Beach House', 'Arooj Aftab', 'Ryuichi Sakamoto', 'Khruangbin', 'Rina Sawayama',
]
const SEARCH_LIMIT = 10
const MARKET = 'US'
const MIN_PREVIEWS_REQUIRED = 5

async function getClientCredentialsToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret)
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET')
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`)
  const data = (await res.json()) as SpotifyTokenResponse
  return data.access_token
}

interface ArtistResult {
  artist: string; total: number; totalHits: number
  withPreview: number; hitRate: number; passes: boolean; edgeCases: string[]
}

async function searchTracksForArtist(artist: string, token: string): Promise<ArtistResult> {
  const params = new URLSearchParams({ q: artist, type: 'track', limit: String(SEARCH_LIMIT) })
  const url = `https://api.spotify.com/v1/search?${params}`
  if (process.env.SPIKE_DEBUG) console.log('  URL:', url)
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Search failed for "${artist}": ${res.status} — ${body}`)
  }
  const data = (await res.json()) as SpotifySearchResponse
  const items = data.tracks?.items ?? []
  const totalHits = data.tracks?.total ?? 0
  const edgeCases: string[] = []
  const nonTracks = items.filter((t) => t.type !== 'track')
  if (nonTracks.length > 0) edgeCases.push(`${nonTracks.length} non-track items`)
  const localFiles = items.filter((t) => t.is_local === true)
  if (localFiles.length > 0) edgeCases.push(`${localFiles.length} local file(s)`)
  const offArtist = items.filter(
    (t) => !t.artists.some(
      (a) => a.name.toLowerCase().includes(artist.toLowerCase()) ||
             artist.toLowerCase().includes(a.name.toLowerCase()),
    ),
  )
  if (offArtist.length > 0)
    edgeCases.push(`${offArtist.length}/${items.length} results don't list "${artist}" as an artist`)
  const withPreview = items.filter((t) => t.preview_url !== null).length
  const hitRate = items.length > 0 ? Math.round((withPreview / items.length) * 100) : 0
  return { artist, total: items.length, totalHits, withPreview, hitRate, passes: withPreview >= MIN_PREVIEWS_REQUIRED, edgeCases }
}

function padEnd(s: string, n: number) { return s.length >= n ? s : s + ' '.repeat(n - s.length) }
function padStart(s: string, n: number) { return s.length >= n ? s : ' '.repeat(n - s.length) + s }

function printTable(results: ArtistResult[]) {
  const [C1, C2, C3, C4, C5] = [20, 7, 14, 11, 7]
  const header = padEnd('Artist', C1) + padStart('Total', C2) + padStart('With Preview', C3) + padStart('Hit Rate %', C4) + padStart('Pass?', C5)
  const sep = '-'.repeat(header.length)
  console.log('\n' + sep); console.log(header); console.log(sep)
  for (const r of results) {
    console.log(
      padEnd(r.artist, C1) + padStart(String(r.total), C2) + padStart(String(r.withPreview), C3) +
      padStart(`${r.hitRate}%`, C4) + padStart(r.passes ? 'YES' : 'NO', C5)
    )
  }
  console.log(sep)
  const passCount = results.filter((r) => r.passes).length
  console.log(`\nVerdict: ${passCount}/${results.length} artists pass (>= ${MIN_PREVIEWS_REQUIRED} previews)`)
  console.log(passCount === results.length
    ? 'PASS — search endpoint looks viable for the Artist Quiz.'
    : `CAUTION — ${results.length - passCount} artist(s) insufficient previews.`)
}

function printEdgeCases(results: ArtistResult[]) {
  const hits = results.filter((r) => r.edgeCases.length > 0)
  if (hits.length === 0) { console.log('\nNo edge cases detected.'); return }
  console.log('\nEdge Cases:')
  for (const r of hits) { console.log(`  ${r.artist}:`); for (const ec of r.edgeCases) console.log(`    - ${ec}`) }
}

async function main() {
  console.log('Obtaining Spotify client credentials token...')
  const token = await getClientCredentialsToken()
  console.log('Token obtained. Running search for each artist...\n')
  const results: ArtistResult[] = []
  for (const artist of TEST_ARTISTS) {
    process.stdout.write(`  Searching "${artist}"... `)
    try {
      const result = await searchTracksForArtist(artist, token)
      results.push(result)
      console.log(`${result.withPreview}/${result.total} with preview`)
    } catch (err) {
      console.error(`ERROR: ${err}`)
      results.push({ artist, total: 0, totalHits: 0, withPreview: 0, hitRate: 0, passes: false, edgeCases: [`Request failed: ${err}`] })
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  printTable(results)
  printEdgeCases(results)
  console.log('\nNotes:')
  console.log(`  - MARKET=${MARKET}. Preview availability varies by market.`)
  console.log(`  - "Total" is capped at SEARCH_LIMIT=${SEARCH_LIMIT}. "With Preview" is from that page.`)
  console.log('  - In production, use q=artist:<name> syntax to reduce off-artist results.')
  console.log('  - Consider GET /artists/{id}/top-tracks as a cleaner alternative if hit rates disappoint.')
}

main().catch((err) => { console.error('\nFatal:', err); process.exit(1) })
