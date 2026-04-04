'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { LAYER_LABELS, LAYER_COLORS, type Service } from '@/types/ecosystem';

interface NodeTooltipProps {
  service: Service;
  x: number;
  y: number;
  isExploreMode?: boolean;
  onClose?: () => void;
}

const EDGE_MARGIN = 12;

export default function NodeTooltip({ service, x, y, isExploreMode = false, onClose }: NodeTooltipProps) {
  // Read viewport once per mount — not on every render
  const vw = typeof window !== 'undefined' ? window.innerWidth  : 1440;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
  const color = LAYER_COLORS[service.layer];

  const TOOLTIP_W = isExploreMode ? 360 : 300;
  const TOOLTIP_H = isExploreMode ? 260 : 220;

  // Memoize position — only recalculate when x/y/vw/vh change
  const { left, top, flipY } = useMemo(() => {
    const fX     = x + 24 + TOOLTIP_W > vw - EDGE_MARGIN;
    const rawL   = fX ? x - TOOLTIP_W - 16 : x + 24;
    const l      = Math.min(Math.max(rawL, EDGE_MARGIN), vw - TOOLTIP_W - EDGE_MARGIN);
    const fY     = y + TOOLTIP_H + 20 > vh - EDGE_MARGIN;
    const rawT   = fY ? y - TOOLTIP_H - 10 : y - 14;
    const t      = Math.max(rawT, EDGE_MARGIN);
    return { left: l, top: t, flipY: fY };
  }, [x, y, vw, vh, TOOLTIP_W, TOOLTIP_H]);

  /* ── EXPLORE MODE — glass slab ──────────────────────────────────────────── */
  if (isExploreMode) {
    return (
      <motion.div
        key={`explore-${service.id}`}
        initial={{ opacity: 0, y: flipY ? 8 : -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        className="fixed z-[9999] select-none"
        style={{ pointerEvents: 'auto', left: 0, top: 0, width: TOOLTIP_W, willChange: 'transform, opacity', transform: `translate(${left}px, ${top}px)` }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${color}`,
          borderRadius: 8,
          boxShadow: `0 0 0 1px ${color}18, 0 0 40px ${color}25, 0 20px 60px rgba(0,0,0,0.95)`,
        }}>
          <div className="h-[3px] rounded-t-lg" style={{ background: `linear-gradient(90deg, ${color}, ${color}50, transparent)` }} />
          <div className="p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded"
                style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {LAYER_LABELS[service.layer]}
              </span>
              {onClose && (
                <button onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="flex items-center justify-center w-6 h-6 rounded transition-colors"
                  style={{ color: `${color}60` }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = color)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = `${color}60`)}>
                  <X size={14} />
                </button>
              )}
            </div>
            <h3 className="font-bold text-[18px] leading-tight tracking-wide" style={{ color }}>
              {service.name}
            </h3>
            <div className="h-px" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }} />
            <p className="text-white text-sm leading-relaxed">{service.fullDescription}</p>
            <div className="flex flex-wrap gap-1.5">
              {service.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{ background: `${color}12`, color: `${color}99`, border: `1px solid ${color}28` }}>
                  {tag}
                </span>
              ))}
            </div>
            <a href={service.officialUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg transition-all group/doc"
              style={{ background: `${color}15`, border: `1px solid ${color}40`, pointerEvents: 'auto', color }}
              onClick={(e) => e.stopPropagation()}>
              <span className="text-sm font-semibold group-hover/doc:text-white transition-colors">Open Official Docs</span>
              <ExternalLink size={14} className="shrink-0 group-hover/doc:text-white transition-colors" />
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── DEFAULT — compact HUD tooltip ─────────────────────────────────────── */
  return (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, scale: 0.94, y: flipY ? 6 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className="fixed z-[9999] select-none"
      style={{ pointerEvents: 'none', left: 0, top: 0, width: TOOLTIP_W, willChange: 'transform, opacity', transform: `translate(${left}px, ${top}px)` }}
    >
      <div className="relative overflow-hidden" style={{
        background: 'rgba(5,5,5,0.97)',
        border: `1px solid ${color}`,
        borderRadius: 3,
        boxShadow: `0 0 0 1px ${color}20, 0 0 24px ${color}20, 0 12px 40px rgba(0,0,0,0.95)`,
      }}>
        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${color}06 3px, ${color}06 4px)`,
        }} />
        {/* Corner brackets */}
        {[
          'top-0 left-0 border-t-2 border-l-2 -translate-x-px -translate-y-px',
          'top-0 right-0 border-t-2 border-r-2  translate-x-px -translate-y-px',
          'bottom-0 left-0 border-b-2 border-l-2 -translate-x-px  translate-y-px',
          'bottom-0 right-0 border-b-2 border-r-2  translate-x-px  translate-y-px',
        ].map((cls, i) => (
          <div key={i} className={`absolute w-2.5 h-2.5 ${cls}`} style={{ borderColor: color }} />
        ))}
        <div className="relative p-4 space-y-3">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm mb-2"
              style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
              {LAYER_LABELS[service.layer]}
            </span>
            <p className="text-white font-bold text-[15px] leading-tight tracking-wide">{service.name}</p>
          </div>
          <div className="h-px" style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}50 60%, transparent 100%)` }} />
          <p className="text-slate-300 text-sm leading-relaxed">{service.shortDescription}</p>
          <div className="flex flex-wrap gap-1">
            {service.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                style={{ background: `${color}10`, color: `${color}88`, border: `1px solid ${color}25` }}>
                {tag}
              </span>
            ))}
          </div>
          <a href={service.officialUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 w-full mt-1 pt-2 transition-colors group/link"
            style={{ borderTop: `1px solid ${color}20`, color: `${color}60`, pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <ExternalLink size={11} className="shrink-0 group-hover/link:text-white transition-colors" style={{ color: 'inherit' }} />
            <span className="text-[11px] font-mono tracking-wide group-hover/link:text-white transition-colors" style={{ color: 'inherit' }}>
              {service.officialUrl.replace(/^https?:\/\//, '').split('/')[0]}
            </span>
            <span className="ml-auto text-[10px] font-mono opacity-60 group-hover/link:opacity-100 transition-opacity">
              Open Docs →
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
