import React, { memo } from 'react';
import { Svg, Line, Circle } from 'react-native-svg';
import type { OverlayProps } from './types';

const CrosshairComponent: React.FC<OverlayProps> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets
}) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.05;
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Line x1={cx} y1={0} x2={cx} y2={height} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={0} y1={cy} x2={width} y2={cy} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Circle cx={cx} cy={cy} r={radius} stroke={color} strokeWidth={thickness} opacity={opacity} fill="none" />
    </Svg>
  );
};

export const Crosshair = memo(CrosshairComponent);
