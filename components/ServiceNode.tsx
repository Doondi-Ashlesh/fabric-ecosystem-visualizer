'use client';

import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { Service, ServiceNodeData } from '@/types/ecosystem';
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
    onHover,
    onMouseMove,
  } = data as ServiceNodeData & {
    onMouseMove?: (service: Service, x: number, y: number) => void;
  };

  const [hovered, setHovered] = useState(false);
  const color = LAYER_COLORS[(service as Service).layer];

  const borderColor = isActiveStep
    ? color
    : isHighlighted
    ? `${color}cc`
    : hovered
    ? `${color}66`
    : '#1e293b';

  const bgColor = isActiveStep || isHighlighted
    ? `${color}12`
    : hovered
    ? `${color}08`
    : 'rgba(8,8,8,0.88)';

  const glowFilter = isActiveStep
    ? `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 28px ${color}80)`
    : isHighlighted
    ? `drop-shadow(0 0 8px ${color}70)`
    : hovered
    ? `drop-shadow(0 0 6px ${color}55)`
    : 'none';

  return (
    <motion.div
      className="relative select-none"
      style={{ width: NODE_W + 4, height: NODE_H + 4, cursor: 'pointer' }}
      animate={{
        opacity: isDimmed ? 0.38 : 1,
        filter:  isDimmed ? 'grayscale(0.6) brightness(0.5)' : glowFilter,
        scale:   hovered && !isDimmed ? 1.06 : 1,
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
            background: isActiveStep ? color : '#0d1117',
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

export default memo(ServiceNodeComponent);
