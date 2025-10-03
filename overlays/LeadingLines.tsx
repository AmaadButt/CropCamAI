import React, { memo } from 'react';
import { Svg, Line } from 'react-native-svg';
import type { OverlayProps } from './types';

const LeadingLinesComponent: React.FC<OverlayProps> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets
}) => {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Line x1={0} y1={height} x2={width / 2} y2={height / 2} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={width} y1={height} x2={width / 2} y2={height / 2} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Line x1={0} y1={0} x2={width / 2} y2={height / 2} stroke={color} strokeWidth={thickness} opacity={opacity * 0.7} />
      <Line x1={width} y1={0} x2={width / 2} y2={height / 2} stroke={color} strokeWidth={thickness} opacity={opacity * 0.7} />
    </Svg>
  );
};

export const LeadingLines = memo(LeadingLinesComponent);
