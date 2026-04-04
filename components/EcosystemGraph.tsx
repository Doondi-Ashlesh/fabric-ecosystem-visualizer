'use client';

import { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ServiceNode from '@/components/ServiceNode';
import NodeTooltip from '@/components/NodeTooltip';
import { FABRIC_SERVICES, INTRA_LAYER_ORDER } from '@/data/fabric';
import { LAYER_ORDER, LAYER_COLORS } from '@/types/ecosystem';
import type { AppMode, Layer, Service, Workflow, ServiceNodeData } from '@/types/ecosystem';

const NODE_TYPES: NodeTypes = { serviceNode: ServiceNode };

// Layout constants  (node is 134 × 134 rendered)
const COL_WIDTH   = 180;
const NODE_HEIGHT = 134;
const V_GAP       = 24;
const H_PADDING   = 60;

interface EcosystemGraphProps {
  mode: AppMode;
  activeWorkflow: Workflow | null;
  activeStepIndex: number;
  focusLayer: Layer | null;
  onHoverService: (service: Service | null) => void;
  onClickService: (service: Service) => void;
}

export default function EcosystemGraph({
  mode,
  activeWorkflow,
  activeStepIndex,
  focusLayer,
  onHoverService,
  onClickService,
}: EcosystemGraphProps) {
  const { fitView } = useReactFlow();

  // Tooltip state — hover (default/workflow) and pinned (explore)
  const [hoverTooltip, setHoverTooltip] = useState<{ service: Service; x: number; y: number } | null>(null);
  const [exploreTooltip, setExploreTooltip] = useState<{ service: Service; x: number; y: number } | null>(null);

  // Track prev focusLayer to detect null transition
  const prevFocusLayer = useRef<Layer | null>(null);
  // Debounce timer for focusLayer fitView — prevents animation queuing when hovering quickly
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort services by INTRA_LAYER_ORDER
  const sortedServices = useMemo(() => {
    return [...FABRIC_SERVICES].sort((a, b) => {
      const ai = INTRA_LAYER_ORDER.indexOf(a.id);
      const bi = INTRA_LAYER_ORDER.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, []);

  // Active service ID in current workflow step
  const activeStepServiceId = useMemo(() => {
    if (mode !== 'workflow' || !activeWorkflow) return null;
    return activeWorkflow.steps[activeStepIndex]?.serviceId ?? null;
  }, [mode, activeWorkflow, activeStepIndex]);

  const workflowServiceIds = useMemo(() => {
    if (!activeWorkflow) return new Set<string>();
    return new Set(activeWorkflow.steps.map((s) => s.serviceId));
  }, [activeWorkflow]);

  // RAF ref — throttles tooltip state to one update per animation frame
  const rafRef = useRef<number | null>(null);

  // Callbacks passed through node data (stable refs)
  const handleNodeHover = useCallback((service: Service | null) => {
    if (mode !== 'explore') {
      onHoverService(service);
      if (!service) {
        if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        setHoverTooltip(null);
      }
    }
  }, [mode, onHoverService]);

  const handleNodeMouseMove = useCallback((service: Service, x: number, y: number) => {
    if (mode !== 'explore') {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setHoverTooltip({ service, x, y });
        rafRef.current = null;
      });
    }
  }, [mode]);

  // Build nodes
  const nodes: Node<ServiceNodeData>[] = useMemo(() => {
    const layerGroups: Record<string, Service[]> = {};
    LAYER_ORDER.forEach((l) => { layerGroups[l] = []; });
    sortedServices.forEach((s) => { layerGroups[s.layer]?.push(s); });

    const result: Node<ServiceNodeData>[] = [];

    LAYER_ORDER.forEach((layer, colIdx) => {
      const services = layerGroups[layer];
      const totalH = services.length * NODE_HEIGHT + (services.length - 1) * V_GAP;
      const startY = -totalH / 2;

      services.forEach((service, rowIdx) => {
        const isActiveStep = mode === 'workflow' && service.id === activeStepServiceId;
        const isHighlighted = mode === 'workflow' && workflowServiceIds.has(service.id);
        const isDimmed = mode === 'workflow' && !workflowServiceIds.has(service.id);

        const rawStep = activeWorkflow?.steps.findIndex((s) => s.serviceId === service.id) ?? -1;
        const stepNumber = mode === 'workflow' && rawStep >= 0 ? rawStep + 1 : undefined;

        result.push({
          id: service.id,
          type: 'serviceNode',
          position: {
            x: H_PADDING + colIdx * COL_WIDTH,
            y: startY + rowIdx * (NODE_HEIGHT + V_GAP),
          },
          data: {
            service,
            isHighlighted,
            isDimmed,
            isActiveStep,
            stepNumber,
            isExploreMode: mode === 'explore',
            onHover: handleNodeHover,
            onMouseMove: handleNodeMouseMove,
          },
        });
      });
    });

    return result;
  }, [sortedServices, mode, activeStepServiceId, workflowServiceIds, activeWorkflow, handleNodeHover, handleNodeMouseMove]);

  // Build edges — workflow path edges are animated + bright; others dimmed
  const edges: Edge[] = useMemo(() => {
    const workflowEdgePairs = new Set<string>();
    if (activeWorkflow) {
      for (let i = 0; i < activeWorkflow.steps.length - 1; i++) {
        workflowEdgePairs.add(`${activeWorkflow.steps[i].serviceId}-${activeWorkflow.steps[i + 1].serviceId}`);
      }
    }

    const result: Edge[] = [];
    FABRIC_SERVICES.forEach((service) => {
      service.connections.forEach((targetId) => {
        if (!FABRIC_SERVICES.find((s) => s.id === targetId)) return;
        const edgeKey = `${service.id}-${targetId}`;
        const isWorkflowEdge = workflowEdgePairs.has(edgeKey);
        result.push({
          id: edgeKey,
          source: service.id,
          target: targetId,
          type: 'smoothstep',
          style: {
            stroke: isWorkflowEdge ? LAYER_COLORS[service.layer] : '#334155',
            strokeWidth: isWorkflowEdge ? 2 : 1,
            opacity: mode === 'workflow' ? (isWorkflowEdge ? 1 : 0.06) : 0.22,
          },
          animated: isWorkflowEdge,
          markerEnd: { type: 'arrowclosed' as const, color: isWorkflowEdge ? LAYER_COLORS[service.layer] : '#334155' },
        });
      });
    });
    return result;
  }, [activeWorkflow, mode]);

  // Pan to active step node
  useEffect(() => {
    if (mode === 'workflow' && activeStepServiceId) {
      fitView({ nodes: [{ id: activeStepServiceId }], duration: 600, padding: 0.6, maxZoom: 1.2 });
    }
  }, [activeStepIndex, activeStepServiceId, mode, fitView]);

  // Reset view on mode change to initial or explore
  useEffect(() => {
    if (mode === 'initial' || mode === 'explore') {
      setHoverTooltip(null);
      setExploreTooltip(null);
      fitView({ duration: 600, padding: 0.08 });
    }
  }, [mode, fitView]);

  // Zoom to focused layer (header hover) or reset to full — debounced 120ms
  useEffect(() => {
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      if (focusLayer) {
        const layerNodeIds = FABRIC_SERVICES
          .filter((s) => s.layer === focusLayer)
          .map((s) => ({ id: s.id }));
        if (layerNodeIds.length > 0) {
          fitView({ nodes: layerNodeIds, duration: 450, padding: 0.25, maxZoom: 1.5 });
        }
      } else if (prevFocusLayer.current !== null) {
        fitView({ duration: 400, padding: 0.08 });
      }
      prevFocusLayer.current = focusLayer;
    }, 120);
    return () => { if (focusTimerRef.current) clearTimeout(focusTimerRef.current); };
  }, [focusLayer, fitView]);

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: Node) => {
      const service = FABRIC_SERVICES.find((s) => s.id === node.id);
      if (!service) return;
      if (mode === 'explore') {
        setExploreTooltip({ service, x: e.clientX, y: e.clientY });
        onClickService(service);
      } else {
        onClickService(service);
      }
    },
    [mode, onClickService]
  );

  const handlePaneClick = useCallback(() => {
    if (mode === 'explore') {
      setExploreTooltip(null);
      onHoverService(null);
    }
    setHoverTooltip(null);
  }, [mode, onHoverService]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        panOnScroll
        zoomOnScroll
        panOnDrag
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0a0a' }}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#1e293b" />
        <Controls showInteractive={false} style={{ background: '#111', border: '1px solid #1e293b' }} />
      </ReactFlow>

      {/* Hover tooltip — default / workflow modes */}
      <AnimatePresence>
        {hoverTooltip && mode !== 'explore' && (
          <NodeTooltip
            key={`hover-${hoverTooltip.service.id}`}
            service={hoverTooltip.service}
            x={hoverTooltip.x}
            y={hoverTooltip.y}
            isExploreMode={false}
          />
        )}
      </AnimatePresence>

      {/* Pinned card — explore mode */}
      <AnimatePresence>
        {exploreTooltip && mode === 'explore' && (
          <NodeTooltip
            key={`explore-${exploreTooltip.service.id}`}
            service={exploreTooltip.service}
            x={exploreTooltip.x}
            y={exploreTooltip.y}
            isExploreMode={true}
            onClose={() => { setExploreTooltip(null); onHoverService(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
