export type OverlayKind =
  | 'thirds'
  | 'crosshair'
  | 'diagonals'
  | 'ellipse'
  | 'frame'
  | 'foregroundEmphasis'
  | 'horizon'
  | 'goldenRatio';

export type RectPct = { xPct?: number; yPct?: number; wPct?: number; hPct?: number };

export type OverlayDef = {
  kind: OverlayKind;
  label?: string;
  color?: string;
  opacity?: number;
  thickness?: number;
  rect?: RectPct;
  insetPct?: number;
  animate?: boolean;
  extras?: Record<string, unknown>;
};

export type ParseSuccess = { ok: true; def: OverlayDef; summary: string };
export type ParseFail = { ok: false; message: string; suggestions: string[] };
export type ParseResult = ParseSuccess | ParseFail;
