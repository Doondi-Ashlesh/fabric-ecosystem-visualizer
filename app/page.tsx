'use client';

import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import EcosystemGraph from '@/components/EcosystemGraph';
import { LAYER_ORDER, LAYER_LABELS, LAYER_SUBLABELS, LAYER_COLORS } from '@/types/ecosystem';
import type { AppMode, Layer, Service, Workflow } from '@/types/ecosystem';
import { FABRIC_SERVICES } from '@/data/fabric';

const FABRIC_BLUE = '#0078D4';
const FABRIC_TEAL = '#00B7C3';

export default function Home() {
  const [mode, setMode]                       = useState<AppMode>('initial');
  const [activeWorkflow, setActiveWorkflow]   = useState<Workflow | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [hoveredService, setHoveredService]   = useState<Service | null>(null);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [focusLayer, setFocusLayer]           = useState<Layer | null>(null);

  const handleSelectWorkflow = useCallback((wf: Workflow) => {
    setActiveWorkflow(wf);
    setActiveStepIndex(0);
    setMode('workflow');
  }, []);

  const handleExplore = useCallback(() => {
    setMode('explore');
    setActiveWorkflow(null);
    setHoveredService(null);
  }, []);

  const handleExitWorkflow = useCallback(() => {
    setMode('initial');
    setActiveWorkflow(null);
    setActiveStepIndex(0);
  }, []);

  const handleBackToInitial = useCallback(() => {
    setMode('initial');
    setActiveWorkflow(null);
    setActiveStepIndex(0);
    setHoveredService(null);
  }, []);

  const handleClickService = useCallback((service: Service) => {
    if (mode === 'explore') {
      setHoveredService(service);
    } else if (mode === 'workflow' && activeWorkflow) {
      const idx = activeWorkflow.steps.findIndex((s) => s.serviceId === service.id);
      if (idx >= 0) setActiveStepIndex(idx);
    }
  }, [mode, activeWorkflow]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 sm:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        mode={mode}
        activeWorkflow={activeWorkflow}
        activeStepIndex={activeStepIndex}
        hoveredService={hoveredService}
        onSelectWorkflow={handleSelectWorkflow}
        onExplore={handleExplore}
        onStepChange={setActiveStepIndex}
        onExitWorkflow={handleExitWorkflow}
        onBackToInitial={handleBackToInitial}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 sm:ml-72">

        {/* Top bar */}
        <div className="h-12 flex items-center px-4 sm:px-6 border-b border-[#1a1a1a] shrink-0 bg-[#0d0d0d] gap-3">

          {/* Hamburger — mobile */}
          <button
            className="sm:hidden shrink-0 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Mode indicator */}
          <div className="flex-1 min-w-0 hidden sm:block">
            {mode === 'initial' && (
              <p className="text-slate-500 text-sm truncate">
                <span className="text-slate-300 font-semibold">Fabric Ecosystem Visualizer</span>
                <span className="hidden lg:inline text-slate-600"> — Describe your goal or explore all 18 services</span>
              </p>
            )}
            {mode === 'explore' && (
              <p className="text-slate-500 text-sm truncate">
                <span className="font-semibold" style={{ color: FABRIC_TEAL }}>Explore Mode</span>
                <span className="hidden lg:inline"> — Click any service node to see its description</span>
              </p>
            )}
            {mode === 'workflow' && activeWorkflow && (
              <p className="text-slate-500 text-sm truncate">
                <span className="font-semibold" style={{ color: FABRIC_BLUE }}>{activeWorkflow.goal}</span>
                <span className="hidden lg:inline"> — Follow the numbered steps</span>
              </p>
            )}
          </div>

          {/* Nav links */}
          <div className="ml-auto hidden lg:flex items-center gap-5 shrink-0">
            <a href="https://learn.microsoft.com/en-us/fabric/" target="_blank" rel="noopener noreferrer"
              className="text-[12px] text-slate-400 hover:text-white transition-colors tracking-wide">Docs</a>
            <a href="https://blog.fabric.microsoft.com" target="_blank" rel="noopener noreferrer"
              className="text-[12px] text-slate-400 hover:text-white transition-colors tracking-wide">Blog</a>
            <a href="https://community.fabric.microsoft.com" target="_blank" rel="noopener noreferrer"
              className="text-[12px] hover:text-white transition-colors tracking-wide" style={{ color: FABRIC_TEAL }}>Community</a>
            <a href="https://learn.microsoft.com/en-us/training/browse/?products=fabric" target="_blank" rel="noopener noreferrer"
              className="text-[12px] text-slate-400 hover:text-white transition-colors tracking-wide">Training</a>
          </div>
        </div>

        {/* Layer headers */}
        <div className="hidden sm:flex h-14 border-b border-[#1a1a1a] shrink-0 bg-[#0a0a0a] items-stretch sm:ml-0">
          {LAYER_ORDER.map((layer) => {
            const count = FABRIC_SERVICES.filter((s) => s.layer === layer).length;
            const color = LAYER_COLORS[layer];
            const isHovered = focusLayer === layer;
            return (
              <div
                key={layer}
                className="flex-1 flex flex-col items-center justify-center px-2 border-r border-[#1a1a1a] last:border-r-0 cursor-pointer transition-colors duration-150"
                style={{ background: isHovered ? `${color}10` : 'transparent' }}
                onMouseEnter={() => setFocusLayer(layer)}
                onMouseLeave={() => setFocusLayer(null)}
              >
                <p className="text-[11px] font-bold tracking-wide truncate transition-colors duration-150" style={{ color: isHovered ? color : `${color}bb` }}>
                  {LAYER_LABELS[layer]}
                </p>
                <p className="text-[9px] text-slate-600 truncate">{LAYER_SUBLABELS[layer]}</p>
                <p className="text-[9px] font-medium mt-0.5" style={{ color: `${color}88` }}>{count} service{count !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>

        {/* Graph */}
        <div className="flex-1 min-h-0">
          <ReactFlowProvider>
            <EcosystemGraph
              mode={mode}
              activeWorkflow={activeWorkflow}
              activeStepIndex={activeStepIndex}
              focusLayer={focusLayer}
              onHoverService={setHoveredService}
              onClickService={handleClickService}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
