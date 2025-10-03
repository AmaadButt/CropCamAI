import React, { memo } from 'react';
import { Svg, Line, Text } from 'react-native-svg';
import type { OverlayProps } from './types';

const HorizonLevelComponent: React.FC<OverlayProps & { tiltDeg?: number }> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets,
  tiltDeg = 0
}) => {
  const centerY = height / 2;
  const slope = Math.tan((tiltDeg * Math.PI) / 180);
  const halfWidth = width / 2;
  const yOffset = slope * halfWidth;
  const y1 = centerY - yOffset;
  const y2 = centerY + yOffset;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <Line x1={0} y1={y1} x2={width} y2={y2} stroke={color} strokeWidth={thickness} opacity={opacity} />
      <Text
        x={width - 60}
        y={centerY - 12}
        fill={color}
        opacity={opacity}
        fontSize={14}
        textAnchor="middle"
      >
        {tiltDeg.toFixed(1)}°
      </Text>
    </Svg>
  );
};

export const HorizonLevel = memo(HorizonLevelComponent);
