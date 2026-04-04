'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { ServiceNodeData } from '@/types/ecosystem';
import { LAYER_COLORS } from '@/types/ecosystem';

interface ServiceNodeProps {
  data: ServiceNodeData;
}

function ServiceNode({ data }: ServiceNodeProps) {
  const { service, isActive, stepNumber, isExploreMode } = data;
  const color = LAYER_COLORS[service.layer];

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.08 : 1,
        opacity: isActive ? 1 : isExploreMode ? 0.85 : 0.75,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        width: 110,
        height: 110,
        borderRadius: '50%',
        background: isActive
          ? `radial-gradient(circle at 35% 35%, ${color}55, ${color}22)`
          : 'radial-gradient(circle at 35% 35%, #1e1e1e, #111)',
        border: `2px solid ${isActive ? color : '#2a2a2a'}`,
        boxShadow: isActive
          ? `0 0 24px ${color}55, 0 0 8px ${color}33`
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isExploreMode ? 'pointer' : 'default',
        position: 'relative',
        padding: '10px',
        gap: '4px',
      }}
    >
      <Handle type="target" position={Position.Left}  style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />

      {/* Step number badge */}
      {isActive && stepNumber !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: color,
            color: '#000',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {stepNumber}
        </div>
      )}

      {/* Service name */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: isActive ? '#fff' : '#94a3b8',
          textAlign: 'center',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          padding: '0 4px',
        }}
      >
        {service.name}
      </span>

      {/* Short description */}
      <span
        style={{
          fontSize: 9,
          color: isActive ? `${color}cc` : '#475569',
          textAlign: 'center',
          lineHeight: 1.2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          padding: '0 6px',
        }}
      >
        {service.shortDescription}
      </span>
    </motion.div>
  );
}

export default memo(ServiceNode);
