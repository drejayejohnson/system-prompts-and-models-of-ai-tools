'use client';

import { useState, useCallback, useEffect } from 'react';
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
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Loading canvas...
      </div>
    ),
  }
);

export default function CanvasPage() {
  const { profile } = useBrandProfile();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearCanvas,
  } = useCanvas();

  const [showGeneration, setShowGeneration] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [nodeGenerationArgs, setNodeGenerationArgs] = useState<{
    topic: string;
    contentType: ContentType;
  } | null>(null);

  // Listen for drag-drop node creation events from the canvas
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, position } = (e as CustomEvent).detail;
      const data = type === 'idea'
        ? { label: 'Idea', text: '', color: '#fef9c3' }
        : { label: 'Prompt', promptText: '', contentType: 'blog_post' };
      addNode(type, data, position);
    };
    window.addEventListener('canvas:add-node', handler);
    return () => window.removeEventListener('canvas:add-node', handler);
  }, [addNode]);

  const handleAddIdea = useCallback(() => {
    addNode('idea', { label: 'Idea', text: '', color: '#fef9c3' });
  }, [addNode]);

  const handleAddPrompt = useCallback(() => {
    addNode('prompt', { label: 'Prompt', promptText: '', contentType: 'blog_post' });
  }, [addNode]);

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
          if (showGeneration) {
            // closing
          } else {
            setShowChat(false);
            setNodeGenerationArgs(null);
          }
        }}
        onChatToggle={() => {
          setShowChat((v) => !v);
          if (!showChat) setShowGeneration(false);
        }}
      />

      <div className="flex-1 flex min-h-0">
        {/* Canvas — owns no state, reads from page */}
        <div className="flex-1 relative overflow-hidden">
          <ReactFlowProvider>
            <CanvasBoard
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onAddIdea={handleAddIdea}
              onAddPrompt={handleAddPrompt}
              onClear={clearCanvas}
              onGenerateFromNode={handleGenerateFromNode}
            />
          </ReactFlowProvider>
        </div>

        {/* Generation Panel */}
        {showGeneration && (
          <div className="w-[420px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
            <GenerationPanel
              brandProfile={profile}
              initialTopic={nodeGenerationArgs?.topic}
              initialContentType={nodeGenerationArgs?.contentType}
              onClose={() => { setShowGeneration(false); setNodeGenerationArgs(null); }}
              onAddToCanvas={handleAddToCanvas}
            />
          </div>
        )}

        {/* Chat Panel */}
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
