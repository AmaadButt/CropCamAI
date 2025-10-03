import React, { memo } from 'react';
import { Svg, Rect, Line } from 'react-native-svg';
import type { OverlayProps } from './types';

const ForegroundEmphasisComponent: React.FC<OverlayProps> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets
}) => {
  const boxHeight = height * 0.3;
  const y = height - boxHeight;
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Rect x={0} y={y} width={width} height={boxHeight} fill={color} opacity={opacity * 0.2} />
      <Line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={width * 0.1} y1={y} x2={width * 0.9} y2={y} stroke={color} strokeWidth={thickness} opacity={opacity * 0.8} />
    </Svg>
  );
};

export const ForegroundEmphasis = memo(ForegroundEmphasisComponent);
