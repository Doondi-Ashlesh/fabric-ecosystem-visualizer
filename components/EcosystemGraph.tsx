'use client';

import { useMemo, useCallback, useEffect } from 'react';
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
import { FABRIC_SERVICES, INTRA_LAYER_ORDER } from '@/data/fabric';
import { LAYER_ORDER, LAYER_COLORS } from '@/types/ecosystem';
import type { AppMode, Service, Workflow, ServiceNodeData } from '@/types/ecosystem';

const NODE_TYPES: NodeTypes = { serviceNode: ServiceNode };

// Layout constants
const COL_WIDTH   = 200;
const NODE_HEIGHT = 120;
const V_GAP       = 30;
const H_PADDING   = 60;

interface EcosystemGraphProps {
  mode: AppMode;
  activeWorkflow: Workflow | null;
  activeStepIndex: number;
  onHoverService: (service: Service | null) => void;
  onClickService: (service: Service) => void;
}

export default function EcosystemGraph({
  mode,
  activeWorkflow,
  activeStepIndex,
  onClickService,
}: EcosystemGraphProps) {
  const { fitView } = useReactFlow();

  // Sort services by INTRA_LAYER_ORDER
  const sortedServices = useMemo(() => {
    return [...FABRIC_SERVICES].sort((a, b) => {
      const ai = INTRA_LAYER_ORDER.indexOf(a.id);
      const bi = INTRA_LAYER_ORDER.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, []);

  // Active service IDs in current workflow
  const activeStepServiceId = useMemo(() => {
    if (mode !== 'workflow' || !activeWorkflow) return null;
    return activeWorkflow.steps[activeStepIndex]?.serviceId ?? null;
  }, [mode, activeWorkflow, activeStepIndex]);

  const workflowServiceIds = useMemo(() => {
    if (!activeWorkflow) return new Set<string>();
    return new Set(activeWorkflow.steps.map((s) => s.serviceId));
  }, [activeWorkflow]);

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
        const isActive =
          mode === 'workflow'
            ? service.id === activeStepServiceId
            : false;

        const isInWorkflow = workflowServiceIds.has(service.id);
        const stepNumber =
          mode === 'workflow' && isActive
            ? (activeWorkflow?.steps.findIndex((s) => s.serviceId === service.id) ?? -1) + 1
            : undefined;

        const opacity =
          mode === 'workflow'
            ? isInWorkflow ? 1 : 0.35
            : 1;

        result.push({
          id: service.id,
          type: 'serviceNode',
          position: {
            x: H_PADDING + colIdx * COL_WIDTH,
            y: startY + rowIdx * (NODE_HEIGHT + V_GAP),
          },
          data: {
            service,
            isActive,
            stepNumber,
            isExploreMode: mode === 'explore',
          },
          style: { opacity },
        });
      });
    });

    return result;
  }, [sortedServices, mode, activeStepServiceId, workflowServiceIds, activeWorkflow]);

  // Build edges
  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    FABRIC_SERVICES.forEach((service) => {
      service.connections.forEach((targetId) => {
        if (FABRIC_SERVICES.find((s) => s.id === targetId)) {
          result.push({
            id: `${service.id}-${targetId}`,
            source: service.id,
            target: targetId,
            style: {
              stroke: LAYER_COLORS[service.layer],
              strokeWidth: 1,
              opacity: 0.2,
            },
            animated: false,
          });
        }
      });
    });
    return result;
  }, []);

  // fitView on step change
  useEffect(() => {
    if (mode === 'workflow' && activeStepServiceId) {
      fitView({ nodes: [{ id: activeStepServiceId }], duration: 600, padding: 0.6, maxZoom: 1.2 });
    }
  }, [activeStepIndex, activeStepServiceId, mode, fitView]);

  // fitView on mode change to initial or explore
  useEffect(() => {
    if (mode === 'initial' || mode === 'explore') {
      fitView({ duration: 600, padding: 0.08 });
    }
  }, [mode, fitView]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const service = FABRIC_SERVICES.find((s) => s.id === node.id);
      if (service) onClickService(service);
    },
    [onClickService]
  );

  return (
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
      className={mode === 'explore' ? 'explore-mode' : ''}
      style={{ background: '#0a0a0a' }}
      onNodeClick={handleNodeClick}
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#1e293b" />
      <Controls showInteractive={false} style={{ background: '#111', border: '1px solid #1e293b' }} />
    </ReactFlow>
  );
}
