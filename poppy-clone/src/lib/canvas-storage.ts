import type { CanvasState } from '@/types/canvas';

const CANVAS_KEY = 'poppy_canvas_v1';

export function saveCanvas(state: CanvasState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${CANVAS_KEY}_${state.id}`, JSON.stringify(state));
  localStorage.setItem(`${CANVAS_KEY}_current`, state.id);
}

export function loadCanvas(id?: string): CanvasState | null {
  if (typeof window === 'undefined') return null;
  const canvasId = id ?? localStorage.getItem(`${CANVAS_KEY}_current`);
  if (!canvasId) return null;
  const raw = localStorage.getItem(`${CANVAS_KEY}_${canvasId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CanvasState;
  } catch {
    return null;
  }
}

export function clearCanvas(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${CANVAS_KEY}_${id}`);
}
