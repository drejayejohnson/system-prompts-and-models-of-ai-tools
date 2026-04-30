'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type Viewport,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { saveCanvas, loadCanvas } from '@/lib/canvas-storage';
import type { CanvasState } from '@/types/canvas';

// Use any-typed node/edge to avoid React Flow's overly strict generic constraints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = Node<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEdge = Edge<any>;

const DEFAULT_CANVAS_ID = 'default';

export function useCanvas() {
  const [canvasId] = useState(DEFAULT_CANVAS_ID);
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<AnyEdge>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load canvas from localStorage on mount
  useEffect(() => {
    const saved = loadCanvas(canvasId);
    if (saved) {
      setNodes((saved.nodes ?? []) as AnyNode[]);
      setEdges((saved.edges ?? []) as AnyEdge[]);
      setViewport(saved.viewport ?? { x: 0, y: 0, zoom: 1 });
    }
  }, [canvasId, setNodes, setEdges]);

  // Debounced save
  const debouncedSave = useCallback(
    (currentNodes: AnyNode[], currentEdges: AnyEdge[], currentViewport: Viewport) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const state: CanvasState = {
          id: canvasId,
          name: 'My Canvas',
          nodes: currentNodes,
          edges: currentEdges,
          viewport: currentViewport,
          savedAt: new Date().toISOString(),
        };
        saveCanvas(state);
      }, 500);
    },
    [canvasId]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
    },
    [setEdges]
  );

  const addNode = useCallback(
    (type: string, data: Record<string, unknown>, position?: { x: number; y: number }) => {
      const pos = position ?? { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 };
      const newNode: AnyNode = {
        id: uuidv4(),
        type,
        position: pos,
        data: { ...data, createdAt: new Date().toISOString() },
      };
      setNodes((nds) => [...nds, newNode]);
      return newNode.id;
    },
    [setNodes]
  );

  const updateNodeData = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
      );
    },
    [setNodes]
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges]
  );

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // Auto-save when nodes/edges change
  useEffect(() => {
    debouncedSave(nodes, edges, viewport);
  }, [nodes, edges, viewport, debouncedSave]);

  return {
    nodes,
    edges,
    viewport,
    onNodesChange: onNodesChange as (changes: NodeChange[]) => void,
    onEdgesChange: onEdgesChange as (changes: EdgeChange[]) => void,
    onConnect,
    setViewport,
    addNode,
    updateNodeData,
    removeNode,
    clearCanvas,
  };
}
