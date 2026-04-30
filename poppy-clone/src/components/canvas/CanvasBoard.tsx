'use client';

import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvas } from '@/hooks/useCanvas';
import { IdeaNode } from './nodes/IdeaNode';
import { PromptNode } from './nodes/PromptNode';
import { ContentNode } from './nodes/ContentNode';
import { CanvasToolbar } from './CanvasToolbar';
import type { ContentType, GenerationRequest } from '@/types/generation';
import type { BrandProfile } from '@/types/brand';

const NODE_TYPES = {
  idea: IdeaNode,
  prompt: PromptNode,
  content: ContentNode,
};

interface CanvasBoardProps {
  brandProfile: BrandProfile | null;
  onGenerateFromNode?: (topic: string, contentType: ContentType) => void;
}

export function CanvasBoard({ brandProfile, onGenerateFromNode }: CanvasBoardProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, clearCanvas } =
    useCanvas();
  const { screenToFlowPosition } = useReactFlow();

  const addIdea = useCallback(() => {
    const pos = { x: 300 + Math.random() * 300, y: 200 + Math.random() * 200 };
    addNode('idea', { label: 'Idea', text: '', color: '#fef9c3' }, pos);
  }, [addNode]);

  const addPrompt = useCallback(() => {
    const pos = { x: 300 + Math.random() * 300, y: 200 + Math.random() * 200 };
    addNode('prompt', { label: 'Prompt', promptText: '', contentType: 'blog_post' }, pos);
  }, [addNode]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('node-type');
      if (!type) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNode(type, { label: type, text: '' }, pos);
    },
    [addNode, screenToFlowPosition]
  );

  const nodeTypes = {
    idea: IdeaNode,
    prompt: (props: Parameters<typeof PromptNode>[0]) =>
      PromptNode({ ...props, onGenerate: onGenerateFromNode }),
    content: ContentNode,
  };

  return (
    <div className="relative w-full h-full">
      <CanvasToolbar
        onAddIdea={addIdea}
        onAddPrompt={addPrompt}
        onClear={clearCanvas}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => {
            if (n.type === 'idea') return '#fef9c3';
            if (n.type === 'prompt') return '#fce7f3';
            return '#dbeafe';
          }}
          maskColor="rgba(248,250,252,0.8)"
        />
      </ReactFlow>
    </div>
  );
}
