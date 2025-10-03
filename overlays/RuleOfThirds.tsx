import React, { memo } from 'react';
import { Svg, Line } from 'react-native-svg';
import type { OverlayProps } from './types';

const RuleOfThirdsComponent: React.FC<OverlayProps> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets
}) => {
  const x1 = width / 3;
  const x2 = (width / 3) * 2;
  const y1 = height / 3;
  const y2 = (height / 3) * 2;
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Line x1={x1} y1={0} x2={x1} y2={height} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={x2} y1={0} x2={x2} y2={height} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={0} y1={y1} x2={width} y2={y1} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={0} y1={y2} x2={width} y2={y2} stroke={color} strokeWidth={thickness} opacity={opacity} />
    </Svg>
  );
};

export const RuleOfThirds = memo(RuleOfThirdsComponent);
