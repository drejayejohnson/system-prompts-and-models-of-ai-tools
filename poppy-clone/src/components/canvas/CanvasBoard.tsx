'use client';

import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { IdeaNode } from './nodes/IdeaNode';
import { PromptNode } from './nodes/PromptNode';
import { ContentNode } from './nodes/ContentNode';
import { CanvasToolbar } from './CanvasToolbar';
import type { ContentType } from '@/types/generation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = import('@xyflow/react').Node<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEdge = import('@xyflow/react').Edge<any>;

interface CanvasBoardProps {
  nodes: AnyNode[];
  edges: AnyEdge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onAddIdea: () => void;
  onAddPrompt: () => void;
  onClear: () => void;
  onGenerateFromNode?: (topic: string, contentType: ContentType) => void;
}

export function CanvasBoard({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddIdea,
  onAddPrompt,
  onClear,
  onGenerateFromNode,
}: CanvasBoardProps) {
  const { screenToFlowPosition } = useReactFlow();

  // Stable nodeTypes — only recreate when onGenerateFromNode changes
  const nodeTypes = useMemo(
    () => ({
      idea: IdeaNode,
      // Pass onGenerate through by creating a stable wrapper component
      prompt: (props: Parameters<typeof PromptNode>[0]) =>
        PromptNode({ ...props, onGenerate: onGenerateFromNode }),
      content: ContentNode,
    }),
    [onGenerateFromNode]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('node-type');
      if (!type) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      // Signal to parent to add a node at this position
      // (parent handles actual addNode since it owns state)
      const event = new CustomEvent('canvas:add-node', {
        detail: { type, position: pos },
      });
      window.dispatchEvent(event);
    },
    [screenToFlowPosition]
  );

  return (
    <div className="relative w-full h-full">
      <CanvasToolbar
        onAddIdea={onAddIdea}
        onAddPrompt={onAddPrompt}
        onClear={onClear}
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
