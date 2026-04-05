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

// Microsoft 4-square logo (small, for the header)
function MicrosoftSquares() {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="0" y="0" width="6" height="6" fill="#F25022" />
      <rect x="8" y="0" width="6" height="6" fill="#7FBA00" />
      <rect x="0" y="8" width="6" height="6" fill="#00A4EF" />
      <rect x="8" y="8" width="6" height="6" fill="#FFB900" />
    </svg>
  );
}

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
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: '#201f1e' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 sm:hidden"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setSidebarOpen(false)}
        />
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

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 sm:ml-72">

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div
          className="h-11 flex items-center px-4 sm:px-5 gap-3 shrink-0"
          style={{ background: '#292827', borderBottom: '1px solid #3b3a39' }}
        >
          {/* Hamburger — mobile */}
          <button
            className="sm:hidden shrink-0 transition-colors"
            style={{ color: '#a19f9d' }}
            onClick={() => setSidebarOpen(true)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f3f2f1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#a19f9d'; }}
          >
            <Menu size={18} />
          </button>

          {/* Branding crumb — desktop */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <MicrosoftSquares />
            <span className="text-[12px] font-semibold" style={{ color: '#f3f2f1' }}>Microsoft Fabric</span>
            <span className="text-[12px]" style={{ color: '#605e5c' }}>/</span>
            <span className="text-[12px]" style={{ color: '#a19f9d' }}>Ecosystem Visualizer</span>
          </div>

          {/* Mode indicator */}
          <div className="flex-1 min-w-0 hidden lg:block">
            {mode === 'initial' && (
              <span className="text-[11px]" style={{ color: '#605e5c' }}>
                Describe your goal or explore all 18 services
              </span>
            )}
            {mode === 'explore' && (
              <span className="text-[11px] font-semibold" style={{ color: FABRIC_TEAL }}>
                Explore Mode — click any node
              </span>
            )}
            {mode === 'workflow' && activeWorkflow && (
              <span className="text-[11px] font-semibold truncate block" style={{ color: FABRIC_BLUE }}>
                {activeWorkflow.goal}
              </span>
            )}
          </div>

          {/* Nav links */}
          <div className="ml-auto hidden lg:flex items-center gap-5 shrink-0">
            <a href="https://learn.microsoft.com/en-us/fabric/" target="_blank" rel="noopener noreferrer"
              className="text-[12px] transition-colors"
              style={{ color: '#a19f9d' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#f3f2f1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a19f9d'; }}>
              Docs
            </a>
            <a href="https://blog.fabric.microsoft.com" target="_blank" rel="noopener noreferrer"
              className="text-[12px] transition-colors"
              style={{ color: '#a19f9d' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#f3f2f1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a19f9d'; }}>
              Blog
            </a>
            <a href="https://community.fabric.microsoft.com" target="_blank" rel="noopener noreferrer"
              className="text-[12px] transition-colors font-medium"
              style={{ color: FABRIC_TEAL }}>
              Community
            </a>
            <a href="https://learn.microsoft.com/en-us/training/browse/?products=fabric" target="_blank" rel="noopener noreferrer"
              className="text-[12px] transition-colors"
              style={{ color: '#a19f9d' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#f3f2f1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#a19f9d'; }}>
              Training
            </a>
          </div>
        </div>

        {/* ── Layer headers ────────────────────────────────────────────────── */}
        <div
          className="hidden sm:flex h-12 shrink-0 items-stretch"
          style={{ background: '#252423', borderBottom: '1px solid #3b3a39' }}
        >
          {LAYER_ORDER.map((layer) => {
            const count    = FABRIC_SERVICES.filter((s) => s.layer === layer).length;
            const color    = LAYER_COLORS[layer];
            const isActive = focusLayer === layer;
            return (
              <div
                key={layer}
                className="flex-1 flex flex-col items-center justify-center px-2 cursor-pointer transition-all duration-150 relative"
                style={{
                  background: isActive ? `${color}14` : 'transparent',
                  borderRight: '1px solid #3b3a39',
                }}
                onMouseEnter={() => setFocusLayer(layer)}
                onMouseLeave={() => setFocusLayer(null)}
              >
                {/* Active indicator bar at top */}
                {isActive && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: color }}
                  />
                )}
                <p
                  className="text-[11px] font-semibold truncate transition-colors duration-150"
                  style={{ color: isActive ? color : '#a19f9d' }}
                >
                  {LAYER_LABELS[layer]}
                </p>
                <p className="text-[9px] truncate mt-0.5" style={{ color: '#605e5c' }}>
                  {LAYER_SUBLABELS[layer]}
                </p>
                <p className="text-[9px] font-medium mt-0.5" style={{ color: `${color}99` }}>
                  {count} service{count !== 1 ? 's' : ''}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Graph ────────────────────────────────────────────────────────── */}
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
