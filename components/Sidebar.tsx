'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, ExternalLink, Compass, Loader2, AlertCircle, Send, Sparkles } from 'lucide-react';
import { LAYER_COLORS, LAYER_LABELS, type AppMode, type Service, type Workflow } from '@/types/ecosystem';
import { FABRIC_SERVICES } from '@/data/fabric';

const FABRIC_BLUE = '#0078D4';
const FABRIC_TEAL = '#00B7C3';


interface SidebarProps {
  mode: AppMode;
  activeWorkflow: Workflow | null;
  activeStepIndex: number;
  hoveredService: Service | null;
  onSelectWorkflow: (wf: Workflow) => void;
  onExplore: () => void;
  onStepChange: (index: number) => void;
  onExitWorkflow: () => void;
  onBackToInitial: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  mode, activeWorkflow, activeStepIndex, hoveredService,
  onSelectWorkflow, onExplore, onStepChange, onExitWorkflow,
  onBackToInitial, isOpen = false, onClose,
}: SidebarProps) {
  const [goal, setGoal]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    if (!goal.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() }),
      });
      const data = await res.json() as { workflow?: Workflow; error?: string };
      if (!res.ok || !data.workflow) throw new Error(data.error ?? 'Unknown error');
      onSelectWorkflow(data.workflow);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error — check your connection');
    } finally {
      setLoading(false);
    }
  }, [goal, loading, onSelectWorkflow]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }, [handleSubmit]);

  const baseClass = `
    fixed top-0 left-0 h-full w-72 flex flex-col z-30
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
  `;

  return (
    <div
      className={baseClass}
      style={{ background: '#111111', borderRight: '1px solid #1e1e1e' }}
    >
      {/* Close button — mobile */}
      {isOpen && (
        <button
          className="absolute top-4 right-4 sm:hidden"
          style={{ color: '#a19f9d' }}
          onClick={onClose}
        >
          <X size={18} />
        </button>
      )}

      {/* ── Branding ──────────────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 shrink-0" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-2.5 mb-0.5">
          <img src="/microsoft-logo.png" width={16} height={16} alt="Microsoft" style={{ mixBlendMode: 'screen' }} />
          <span className="text-[14px] font-semibold" style={{ color: '#f3f2f1', letterSpacing: '0.01em' }}>
            Microsoft
          </span>
        </div>
        <p className="text-[16px] font-semibold pl-[24px]" style={{ color: FABRIC_BLUE }}>
          Fabric Ecosystem
        </p>
      </div>

      {/* ── Layer legend ──────────────────────────────────────────────────── */}
      <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <p className="text-[11px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#605e5c' }}>
          Layers
        </p>
        <div className="flex flex-col gap-1.5">
          {(Object.entries(LAYER_LABELS) as [keyof typeof LAYER_LABELS, string][]).map(([layer, label]) => (
            <div key={layer} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: LAYER_COLORS[layer] }} />
              <span className="text-[12px]" style={{ color: '#a19f9d' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
        <AnimatePresence mode="wait">

          {/* ── INITIAL ─────────────────────────────────────────── */}
          {mode === 'initial' && (
            <motion.div key="initial"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-[12px] uppercase tracking-widest font-semibold mb-2" style={{ color: FABRIC_TEAL }}>
                AI Goal Generator
              </p>
              <p className="text-[14px] leading-relaxed mb-4" style={{ color: '#a19f9d' }}>
                Describe your data or analytics goal and get a step-by-step Microsoft Fabric workflow instantly.
              </p>

              <div className="relative mb-3">
                <textarea
                  ref={inputRef}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. Build a real-time IoT monitoring dashboard..."
                  rows={3}
                  className="w-full rounded-md px-3 py-2.5 text-[14px] resize-none focus:outline-none transition-colors"
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #605e5c',
                    color: '#f3f2f1',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = FABRIC_BLUE; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#605e5c'; }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading || !goal.trim()}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded transition-opacity disabled:opacity-40"
                  style={{ background: goal.trim() && !loading ? FABRIC_BLUE : '#1e1e1e' }}
                >
                  {loading
                    ? <Loader2 size={14} className="animate-spin" style={{ color: '#fff' }} />
                    : <Send size={14} style={{ color: '#fff' }} />
                  }
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs mb-3 p-2.5 rounded"
                  style={{ background: '#2d1f1f', border: '1px solid #5c2d2d', color: '#f87171' }}>
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={onExplore}
                className="w-full flex items-center justify-center gap-2 py-2 rounded text-[14px] transition-all"
                style={{ border: '1px solid #1e1e1e', color: '#a19f9d' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = FABRIC_BLUE;
                  e.currentTarget.style.color = '#f3f2f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e1e1e';
                  e.currentTarget.style.color = '#a19f9d';
                }}
              >
                <Compass size={14} />
                Explore Freely
              </button>

              <p className="text-[12px] mt-4 text-center" style={{ color: '#605e5c' }}>
                18 services · 6 layers · official docs
              </p>
            </motion.div>
          )}

          {/* ── WORKFLOW ─────────────────────────────────────────── */}
          {mode === 'workflow' && activeWorkflow && (
            <motion.div key="workflow"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: FABRIC_TEAL }}>
                    AI Generated
                  </p>
                  <p className="font-semibold text-sm leading-snug" style={{ color: '#f3f2f1' }}>
                    {activeWorkflow.goal}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#a19f9d' }}>
                    Step {activeStepIndex + 1} of {activeWorkflow.steps.length} ·{' '}
                    <span className="capitalize">{activeWorkflow.difficulty}</span>
                  </p>
                </div>
                <button onClick={onExitWorkflow} style={{ color: '#605e5c' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f3f2f1'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#605e5c'; }}
                  className="shrink-0 mt-0.5 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-2 mb-5">
                {activeWorkflow.steps.map((step, idx) => {
                  const svc = FABRIC_SERVICES.find((s) => s.id === step.serviceId);
                  const isActive = idx === activeStepIndex;
                  const color = svc ? LAYER_COLORS[svc.layer] : FABRIC_BLUE;
                  return (
                    <button
                      key={step.serviceId}
                      onClick={() => onStepChange(idx)}
                      className="w-full text-left p-3 rounded transition-all"
                      style={{
                        background: isActive ? `${color}18` : 'transparent',
                        border: `1px solid ${isActive ? `${color}55` : '#1e1e1e'}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{
                            background: isActive ? color : '#1e1e1e',
                            color: isActive ? '#fff' : '#605e5c',
                          }}>
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-semibold"
                          style={{ color: isActive ? color : '#605e5c' }}>
                          {step.action}
                        </span>
                      </div>
                      <p className="text-xs font-semibold pl-7 leading-snug" style={{ color: '#f3f2f1' }}>
                        {svc?.name ?? step.serviceId}
                      </p>
                      {isActive && (
                        <p className="text-xs pl-7 mt-1 leading-relaxed" style={{ color: '#a19f9d' }}>
                          {step.detail}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Nav */}
              <div className="flex gap-2">
                <button
                  onClick={() => onStepChange(Math.max(0, activeStepIndex - 1))}
                  disabled={activeStepIndex === 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs transition-all disabled:opacity-30"
                  style={{ border: '1px solid #1e1e1e', color: '#a19f9d' }}
                  onMouseEnter={(e) => {
                    if (!(e.currentTarget as HTMLButtonElement).disabled) {
                      e.currentTarget.style.borderColor = FABRIC_BLUE;
                      e.currentTarget.style.color = '#f3f2f1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e1e1e';
                    e.currentTarget.style.color = '#a19f9d';
                  }}
                >
                  <ChevronLeft size={13} /> Back
                </button>
                <button
                  onClick={() => onStepChange(Math.min(activeWorkflow.steps.length - 1, activeStepIndex + 1))}
                  disabled={activeStepIndex === activeWorkflow.steps.length - 1}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-white text-xs transition-all disabled:opacity-30"
                  style={{ background: FABRIC_BLUE }}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── EXPLORE ──────────────────────────────────────────── */}
          {mode === 'explore' && (
            <motion.div key="explore"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: FABRIC_TEAL }}>
                  Explore Mode
                </p>
                <button onClick={onBackToInitial} style={{ color: '#605e5c' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f3f2f1'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#605e5c'; }}
                  className="transition-colors">
                  <X size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {hoveredService ? (
                  <motion.div key={hoveredService.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Service header card */}
                    <div className="p-4 rounded mb-3"
                      style={{
                        background: `${LAYER_COLORS[hoveredService.layer]}12`,
                        border: `1px solid ${LAYER_COLORS[hoveredService.layer]}35`,
                      }}>
                      <p className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                        style={{ color: LAYER_COLORS[hoveredService.layer] }}>
                        {LAYER_LABELS[hoveredService.layer]}
                      </p>
                      <p className="font-bold text-base leading-snug mb-1" style={{ color: '#f3f2f1' }}>
                        {hoveredService.name}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#a19f9d' }}>
                        {hoveredService.shortDescription}
                      </p>
                    </div>

                    {/* Full description */}
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#c8c6c4' }}>
                      {hoveredService.fullDescription}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hoveredService.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ border: '1px solid #1e1e1e', color: '#a19f9d', background: '#323130' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Docs link */}
                    <a href={hoveredService.officialUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-white text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ background: LAYER_COLORS[hoveredService.layer] }}>
                      Open Official Docs <ExternalLink size={13} />
                    </a>
                  </motion.div>
                ) : (
                  <motion.div key="hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-3 pt-8 text-center"
                  >
                    <div className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ background: `${FABRIC_TEAL}18` }}>
                      <Compass size={18} style={{ color: FABRIC_TEAL }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#a19f9d' }}>
                      Click on any service node to see its official description.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 shrink-0" style={{ borderTop: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={11} style={{ color: FABRIC_TEAL }} />
          <span className="text-[10px]" style={{ color: '#605e5c' }}>Phi-4 · GitHub Models</span>
        </div>
      </div>
    </div>
  );
}
