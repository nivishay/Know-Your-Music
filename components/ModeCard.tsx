"use client";

interface ModeCardProps {
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export function ModeCard({ title, description, onClick, badge }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 p-6 rounded-2xl border-2 border-gray-200 text-left w-full min-h-[120px] hover:border-green-500 active:scale-95 transition-all"
    >
      <span className="text-lg font-bold">{title}</span>
      {badge && <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{badge}</span>}
      <span className="text-sm text-gray-500">{description}</span>
    </button>
  );
}
