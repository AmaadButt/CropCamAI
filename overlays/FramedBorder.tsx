import React, { memo } from 'react';
import { Svg, Rect } from 'react-native-svg';
import type { OverlayProps } from './types';

const FramedBorderComponent: React.FC<OverlayProps & { insetPct?: number }> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets,
  insetPct
}) => {
  const inset = insetPct ?? 0.1;
  const insetX = width * inset;
  const insetY = height * inset;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Rect
        x={insetX}
        y={insetY}
        width={width - insetX * 2}
        height={height - insetY * 2}
        stroke={color}
        strokeWidth={thickness}
        opacity={opacity}
        fill="none"
        rx={Math.min(insetX, insetY) * 0.2}
      />
    </Svg>
  );
};

export const FramedBorder = memo(FramedBorderComponent);
