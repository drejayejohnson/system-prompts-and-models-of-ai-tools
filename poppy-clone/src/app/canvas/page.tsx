'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ReactFlowProvider } from '@xyflow/react';
import { AppShell } from '@/components/layout/AppShell';
import { TopBar } from '@/components/layout/TopBar';
import { GenerationPanel } from '@/components/generation/GenerationPanel';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { useBrandProfile } from '@/hooks/useBrandProfile';
import { useCanvas } from '@/hooks/useCanvas';
import type { ContentType } from '@/types/generation';

const CanvasBoard = dynamic(
  () => import('@/components/canvas/CanvasBoard').then((m) => m.CanvasBoard),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center text-slate-400">Loading canvas...</div> }
);

export default function CanvasPage() {
  const { profile } = useBrandProfile();
  const { addNode } = useCanvas();
  const [showGeneration, setShowGeneration] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [nodeGenerationArgs, setNodeGenerationArgs] = useState<{
    topic: string;
    contentType: ContentType;
  } | null>(null);

  const handleGenerateFromNode = useCallback(
    (topic: string, contentType: ContentType) => {
      setNodeGenerationArgs({ topic, contentType });
      setShowGeneration(true);
      setShowChat(false);
    },
    []
  );

  const handleAddToCanvas = useCallback(
    (text: string, contentType: ContentType) => {
      addNode('content', {
        label: contentType,
        contentType,
        generatedText: text,
      });
    },
    [addNode]
  );

  return (
    <AppShell>
      <TopBar
        title="Canvas"
        brandName={profile?.name}
        showGenerateButton
        showChatButton
        onGenerateToggle={() => {
          setShowGeneration((v) => !v);
          setShowChat(false);
          setNodeGenerationArgs(null);
        }}
        onChatToggle={() => {
          setShowChat((v) => !v);
          setShowGeneration(false);
        }}
      />

      <div className="flex-1 flex min-h-0 relative">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <CanvasBoard
              brandProfile={profile}
              onGenerateFromNode={handleGenerateFromNode}
            />
          </ReactFlowProvider>
        </div>

        {/* Generation Panel (slide-in from right) */}
        {showGeneration && (
          <div className="w-[420px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
            <GenerationPanel
              brandProfile={profile}
              initialTopic={nodeGenerationArgs?.topic}
              initialContentType={nodeGenerationArgs?.contentType}
              onClose={() => setShowGeneration(false)}
              onAddToCanvas={handleAddToCanvas}
            />
          </div>
        )}

        {/* Chat Panel (slide-in from right) */}
        {showChat && (
          <div className="w-[380px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
            <ChatPanel
              brandProfile={profile}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
