import React, { memo } from 'react';
import { Svg, Ellipse as SvgEllipse } from 'react-native-svg';
import type { OverlayProps } from './types';

const EllipseComponent: React.FC<OverlayProps & { rectPct?: { wPct?: number; hPct?: number } }> = ({
  width,
  height,
  color,
  opacity,
  thickness,
  safeInsets,
  rectPct
}) => {
  const wPct = rectPct?.wPct ?? 0.6;
  const hPct = rectPct?.hPct ?? 0.4;
  const rx = (width * wPct) / 2;
  const ry = (height * hPct) / 2;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: safeInsets.top }}>
      <SvgEllipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        stroke={color}
        strokeWidth={thickness}
        opacity={opacity}
        fill="none"
      />
    </Svg>
  );
};

export const Ellipse = memo(EllipseComponent);
