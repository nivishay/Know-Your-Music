import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const cookieStore = await cookies()
  if (cookieStore.has('access_token')) {
    redirect('/home')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Know Your Music</h1>
      <p className="text-lg text-gray-500">How well do you really know your songs?</p>
      <a
        href="/auth/login"
        className="rounded-full bg-green-500 px-8 py-3 font-semibold text-white hover:bg-green-400"
      >
        Connect with Spotify
      </a>
    </main>
  )
}
