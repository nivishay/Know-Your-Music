export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <p className="mt-2 text-gray-500">Session: {sessionId} — coming soon</p>
    </main>
  );
}
