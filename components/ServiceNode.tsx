'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { Service, ServiceNodeData, Layer } from '@/types/ecosystem';
import { LAYER_COLORS } from '@/types/ecosystem';

const NODE_W = 130;
const NODE_H = 130;

function ServiceNodeComponent({ data }: NodeProps) {
  const {
    service,
    stepNumber,
    isHighlighted,
    isDimmed,
    isActiveStep,
    isExploreMode,
    focusLayer,
    onHover,
    onMouseMove,
  } = data as ServiceNodeData & {
    onMouseMove?: (service: Service, x: number, y: number) => void;
  };

  const [hovered, setHovered] = useState(false);
  const color = LAYER_COLORS[(service as Service).layer];

  // Layer focus states — when a layer header is hovered
  const isLayerFocused = (focusLayer as Layer | null) !== null && (service as Service).layer === (focusLayer as Layer);
  const isLayerDimmed  = (focusLayer as Layer | null) !== null && !isLayerFocused;

  const borderColor = isActiveStep
    ? color
    : isHighlighted
    ? `${color}cc`
    : hovered
    ? `${color}66`
    : '#3b3a39';

  const bgColor = isActiveStep || isHighlighted
    ? `${color}14`
    : hovered
    ? `${color}0a`
    : 'rgba(41,40,39,0.92)';

  const glowFilter = isActiveStep
    ? `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 28px ${color}80)`
    : isLayerFocused
    ? `drop-shadow(0 0 12px ${color}90) drop-shadow(0 0 4px ${color}60)`
    : isHighlighted
    ? `drop-shadow(0 0 8px ${color}70)`
    : hovered
    ? `drop-shadow(0 0 6px ${color}55)`
    : 'none';

  return (
    <motion.div
      className="relative select-none"
      style={{ width: NODE_W + 4, height: NODE_H + 4, cursor: 'pointer', willChange: 'transform, filter, opacity' }}
      animate={{
        opacity: isDimmed ? 0.12 : isLayerDimmed ? 0.10 : 1,
        filter:  isDimmed
          ? 'grayscale(1) brightness(0.2)'
          : isLayerDimmed
          ? 'grayscale(1) brightness(0.2)'
          : glowFilter,
        scale: hovered && !isDimmed && !isLayerDimmed ? 1.06 : isLayerFocused && !hovered ? 1.04 : 1,
      }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onMouseEnter={(e) => {
        setHovered(true);
        if (!isExploreMode) {
          (onHover as (s: Service | null) => void)?.(service as Service);
          (onMouseMove as ((s: Service, x: number, y: number) => void) | undefined)?.(service as Service, e.clientX, e.clientY);
        }
      }}
      onMouseMove={(e) => {
        if (!isExploreMode) {
          (onMouseMove as ((s: Service, x: number, y: number) => void) | undefined)?.(service as Service, e.clientX, e.clientY);
        }
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (!isExploreMode) {
          (onHover as (s: Service | null) => void)?.(null);
        }
      }}
    >
      {/* Active-step radial pulse */}
      {isActiveStep && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          animate={{ opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-full h-full rounded-full" style={{
            background: `radial-gradient(ellipse at center, ${color}35 0%, transparent 70%)`,
          }} />
        </motion.div>
      )}

      {/* Outer circle — border ring */}
      <div className="absolute inset-0 rounded-full" style={{ background: borderColor }} />

      {/* Inner circle — glassmorphism content */}
      <div
        className="absolute flex flex-col items-center justify-center gap-1 rounded-full"
        style={{
          top: 2, left: 2, right: 2, bottom: 2,
          background: bgColor,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <span className="text-[11px] font-bold text-white text-center leading-tight px-3 line-clamp-2">
          {(service as Service).name}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: `${color}bb` }}>
          {(service as Service).tags[0]}
        </span>
      </div>

      {/* Step badge */}
      {stepNumber !== undefined && (
        <div
          className="absolute -top-1 -right-1 w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] font-black z-20"
          style={{
            background: isActiveStep ? color : '#292827',
            color:      isActiveStep ? '#fff' : color,
            border:     `1.5px solid ${color}`,
            boxShadow:  isActiveStep ? `0 0 10px ${color}` : 'none',
          }}
        >
          {stepNumber}
        </div>
      )}

      <Handle type="target" position={Position.Left}  style={{ background: 'transparent', border: 'none', width: 6, height: 6, left: 4 }} />
      <Handle type="source" position={Position.Right} style={{ background: 'transparent', border: 'none', width: 6, height: 6, right: 4 }} />
    </motion.div>
  );
}

// Custom comparator — ignores callback refs so memo() actually prevents re-renders
export default memo(ServiceNodeComponent, (prev, next) => {
  const pd = prev.data as ServiceNodeData;
  const nd = next.data as ServiceNodeData;
  return (
    pd.service.id    === nd.service.id    &&
    pd.isHighlighted === nd.isHighlighted &&
    pd.isDimmed      === nd.isDimmed      &&
    pd.isActiveStep  === nd.isActiveStep  &&
    pd.stepNumber    === nd.stepNumber    &&
    pd.isExploreMode === nd.isExploreMode &&
    pd.focusLayer    === nd.focusLayer
  );
});
