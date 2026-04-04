'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, X, ExternalLink, Compass, Loader2, AlertCircle, Send } from 'lucide-react';
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
    fixed top-0 left-0 h-full w-72 bg-[#0d0d0d] border-r border-[#1a1a1a]
    flex flex-col z-30 transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
  `;

  return (
    <div className={baseClass}>

      {/* Close button — mobile */}
      {isOpen && (
        <button
          className="absolute top-4 right-4 sm:hidden text-slate-400 hover:text-white"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      )}

      {/* Branding */}
      <div className="px-6 pt-6 pb-5 border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-2.5 mb-1">
          {/* Microsoft Fabric logo mark — F in fabric teal */}
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: `linear-gradient(135deg, ${FABRIC_BLUE}, ${FABRIC_TEAL})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 15, color: '#fff', fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.03em',
          }}>
            F
          </div>
          <span className="text-[13px] font-black tracking-[0.18em] uppercase leading-none" style={{ color: FABRIC_BLUE }}>
            MICROSOFT
          </span>
        </div>
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 pl-[38px]">
          Fabric Ecosystem
        </p>
      </div>

      {/* Layer legend */}
      <div className="px-6 py-3 border-b border-[#1a1a1a] shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2">Layers</p>
        <div className="flex flex-col gap-1">
          {(Object.entries(LAYER_LABELS) as [keyof typeof LAYER_LABELS, string][]).map(([layer, label]) => (
            <div key={layer} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LAYER_COLORS[layer] }} />
              <span className="text-[11px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
        <AnimatePresence mode="wait">

          {/* ── INITIAL ─────────────────────────────────────────────── */}
          {mode === 'initial' && (
            <motion.div key="initial"
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: FABRIC_TEAL }}>
                AI Goal Generator
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
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
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#0078D4] transition-colors"
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading || !goal.trim()}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-md transition-colors disabled:opacity-40"
                  style={{ background: goal.trim() && !loading ? FABRIC_BLUE : '#1e293b' }}
                >
                  {loading ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-red-400 text-xs mb-3 p-2.5 bg-red-950/30 rounded-lg border border-red-900/40">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={onExplore}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#1e293b] text-slate-400 hover:text-white hover:border-[#0078D4] text-sm transition-all"
              >
                <Compass size={14} />
                Explore Freely
              </button>

              <p className="text-slate-600 text-xs mt-4 text-center">18 services · 6 layers · official docs</p>
            </motion.div>
          )}

          {/* ── WORKFLOW ─────────────────────────────────────────────── */}
          {mode === 'workflow' && activeWorkflow && (
            <motion.div key="workflow"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: FABRIC_TEAL }}>
                    AI Generated
                  </p>
                  <p className="text-white font-semibold text-sm leading-snug">{activeWorkflow.goal}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Step {activeStepIndex + 1} of {activeWorkflow.steps.length} ·{' '}
                    <span className="capitalize">{activeWorkflow.difficulty}</span>
                  </p>
                </div>
                <button onClick={onExitWorkflow} className="text-slate-600 hover:text-slate-300 shrink-0 mt-0.5">
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
                      className="w-full text-left p-3 rounded-lg border transition-all"
                      style={{
                        background: isActive ? `${color}15` : 'transparent',
                        borderColor: isActive ? `${color}60` : '#1e293b',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ background: isActive ? color : '#1e293b', color: isActive ? '#fff' : '#64748b' }}>
                          {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: isActive ? color : '#64748b' }}>
                          {step.action}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 pl-7 leading-snug">
                        {svc?.name ?? step.serviceId}
                      </p>
                      {isActive && (
                        <p className="text-xs text-slate-400 pl-7 mt-1 leading-relaxed">{step.detail}</p>
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#1e293b] text-slate-400 hover:text-white hover:border-[#0078D4] text-xs transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={13} /> Back
                </button>
                <button
                  onClick={() => onStepChange(Math.min(activeWorkflow.steps.length - 1, activeStepIndex + 1))}
                  disabled={activeStepIndex === activeWorkflow.steps.length - 1}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-white text-xs transition-all disabled:opacity-30"
                  style={{ background: FABRIC_BLUE }}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── EXPLORE ──────────────────────────────────────────────── */}
          {mode === 'explore' && (
            <motion.div key="explore"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: FABRIC_TEAL }}>
                  Explore Mode
                </p>
                <button onClick={onBackToInitial} className="text-slate-600 hover:text-slate-300">
                  <X size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {hoveredService ? (
                  <motion.div key={hoveredService.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Service header */}
                    <div className="p-4 rounded-xl border mb-3"
                      style={{ background: `${LAYER_COLORS[hoveredService.layer]}10`, borderColor: `${LAYER_COLORS[hoveredService.layer]}30` }}>
                      <p className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                        style={{ color: LAYER_COLORS[hoveredService.layer] }}>
                        {LAYER_LABELS[hoveredService.layer]}
                      </p>
                      <p className="text-white font-bold text-base leading-snug mb-1">{hoveredService.name}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{hoveredService.shortDescription}</p>
                    </div>

                    {/* Full description */}
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">{hoveredService.fullDescription}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hoveredService.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#1e293b] text-slate-400">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Docs link */}
                    <a href={hoveredService.officialUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-medium transition-all"
                      style={{ background: LAYER_COLORS[hoveredService.layer] }}>
                      Open Official Docs <ExternalLink size={13} />
                    </a>
                  </motion.div>
                ) : (
                  <motion.div key="hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-3 pt-8 text-center"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${FABRIC_TEAL}20` }}>
                      <Compass size={18} style={{ color: FABRIC_TEAL }} />
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Click on any service node to see its official description.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={12} style={{ color: FABRIC_TEAL }} />
          <span className="text-[10px] text-slate-600">Powered by Groq · llama-3.3-70b</span>
        </div>
      </div>
    </div>
  );
}
