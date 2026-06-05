"use client";

export function ShareButton() {
  function handleShare() {
    navigator.clipboard.writeText(`${window.location.origin}/daily`);
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
    >
      Share
    </button>
  );
}
