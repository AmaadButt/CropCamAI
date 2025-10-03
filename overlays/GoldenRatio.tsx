import React, { memo } from 'react';
import { Svg, Line } from 'react-native-svg';
import type { OverlayProps } from './types';

const GOLDEN_RATIO = 0.618;

const GoldenRatioComponent: React.FC<OverlayProps> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets
}) => {
  const x = width * GOLDEN_RATIO;
  const y = height * GOLDEN_RATIO;
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Line x1={x} y1={0} x2={x} y2={height} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={thickness} opacity={opacity} />
    </Svg>
  );
};

export const GoldenRatio = memo(GoldenRatioComponent);
