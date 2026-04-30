'use client';

interface TopBarProps {
  title: string;
  brandName?: string;
  onChatToggle?: () => void;
  onGenerateToggle?: () => void;
  showChatButton?: boolean;
  showGenerateButton?: boolean;
}

export function TopBar({
  title,
  brandName,
  onChatToggle,
  onGenerateToggle,
  showChatButton = false,
  showGenerateButton = false,
}: TopBarProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-slate-800">{title}</h1>
        {brandName && (
          <span className="text-xs bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full font-medium">
            {brandName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-full">
          claude-sonnet-4-6
        </span>
        {showGenerateButton && (
          <button
            onClick={onGenerateToggle}
            className="flex items-center gap-1.5 bg-pink-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-pink-600 transition-colors"
          >
            ✨ Generate
          </button>
        )}
        {showChatButton && (
          <button
            onClick={onChatToggle}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            💬 Chat
          </button>
        )}
      </div>
    </header>
  );
}
