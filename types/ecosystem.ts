// ---------------------------------------------------------------------------
// Microsoft Fabric Ecosystem — Shared Types
// ---------------------------------------------------------------------------

export type Layer =
  | 'foundation'
  | 'ingestion'
  | 'storage'
  | 'processing'
  | 'analytics'
  | 'delivery';

export type AppMode = 'initial' | 'workflow' | 'explore';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  officialUrl: string;
  layer: Layer;
  tags: string[];
  connections: string[];
}

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  serviceId: string;
  action: string;
  detail: string;
}

export interface Workflow {
  id: string;
  goal: string;
  difficulty: Difficulty;
  steps: WorkflowStep[];
}

// ---------------------------------------------------------------------------
// Layer metadata
// ---------------------------------------------------------------------------

export const LAYER_ORDER: Layer[] = [
  'foundation',
  'ingestion',
  'storage',
  'processing',
  'analytics',
  'delivery',
];

export const LAYER_LABELS: Record<Layer, string> = {
  foundation: 'Foundation',
  ingestion:  'Ingestion',
  storage:    'Storage',
  processing: 'Processing',
  analytics:  'Analytics & AI',
  delivery:   'Delivery',
};

export const LAYER_SUBLABELS: Record<Layer, string> = {
  foundation: 'Unified storage',
  ingestion:  'Connect & move data',
  storage:    'Persist & organize',
  processing: 'Transform & compute',
  analytics:  'Analyze & predict',
  delivery:   'Report & govern',
};

export const LAYER_COLORS: Record<Layer, string> = {
  foundation: '#0078D4',
  ingestion:  '#00B7C3',
  storage:    '#2d7d9a',
  processing: '#5c6bc0',
  analytics:  '#7b52ab',
  delivery:   '#0078D4',
};

// ---------------------------------------------------------------------------
// React Flow node data
// ---------------------------------------------------------------------------

export interface ServiceNodeData {
  service: Service;
  isHighlighted: boolean;
  isDimmed: boolean;
  isActiveStep: boolean;
  stepNumber?: number;
  isExploreMode: boolean;
  focusLayer?: Layer | null;
  onHover?: (service: Service | null) => void;
  [key: string]: unknown;
}
