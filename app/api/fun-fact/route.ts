import { getFunFact } from '@/lib/gemini/fun-fact'

export async function POST(request: Request) {
  const { song, artist, year } = await request.json()
  const fact = await getFunFact(song, artist, year)
  return Response.json({ fact })
}
