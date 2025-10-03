import { RuleOfThirds } from './RuleOfThirds';
import { Crosshair } from './Crosshair';
import { LeadingLines } from './LeadingLines';
import { Ellipse } from './Ellipse';
import { FramedBorder } from './FramedBorder';
import { ForegroundEmphasis } from './ForegroundEmphasis';
import { HorizonLevel } from './HorizonLevel';
import { GoldenRatio } from './GoldenRatio';

export type OverlayRegistryEntry = {
  id: string;
  label: string;
  Component: React.ComponentType<any>;
};

export const OVERLAY_REGISTRY: OverlayRegistryEntry[] = [
  { id: 'thirds', label: 'Rule of Thirds', Component: RuleOfThirds },
  { id: 'crosshair', label: 'Crosshair', Component: Crosshair },
  { id: 'diagonals', label: 'Leading Lines', Component: LeadingLines },
  { id: 'ellipse', label: 'Centered Ellipse', Component: Ellipse },
  { id: 'frame', label: 'Framed Border', Component: FramedBorder },
  { id: 'foregroundEmphasis', label: 'Foreground Emphasis', Component: ForegroundEmphasis },
  { id: 'horizon', label: 'Horizon Level', Component: HorizonLevel },
  { id: 'goldenRatio', label: 'Golden Ratio', Component: GoldenRatio }
];

export const findOverlay = (id: string) => OVERLAY_REGISTRY.find(item => item.id === id);
