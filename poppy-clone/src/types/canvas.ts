import type { ContentType, GenerationRequest } from './generation';

export type NodeType = 'content' | 'prompt' | 'idea' | 'image';

export interface BaseNodeData {
  label: string;
  createdAt: string;
}

export interface ContentNodeData extends BaseNodeData {
  contentType: ContentType;
  generatedText: string;
  generationParams?: GenerationRequest;
}

export interface PromptNodeData extends BaseNodeData {
  promptText: string;
  contentType: ContentType;
}

export interface IdeaNodeData extends BaseNodeData {
  text: string;
  color: string;
}

export type AnyNodeData = ContentNodeData | PromptNodeData | IdeaNodeData;

export interface CanvasState {
  id: string;
  name: string;
  nodes: import('@xyflow/react').Node[];
  edges: import('@xyflow/react').Edge[];
  savedAt: string;
  viewport: { x: number; y: number; zoom: number };
}
