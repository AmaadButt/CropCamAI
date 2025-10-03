import type { OverlayDef, ParseResult, ParseSuccess } from './OverlayDef';

const colorKeywords: Record<string, string> = {
  red: '#eb5757',
  blue: '#2f80ed',
  green: '#27ae60',
  yellow: '#f2c94c',
  white: '#ffffff',
  black: '#000000'
};

const suggestions = [
  'add thirds grid',
  'draw ellipse 70% wide 40% tall',
  'frame with 10% inset',
  'show horizon level',
  'diagonal cross',
  'foreground lower third guide'
];

const clampPct = (pct: number) => Math.max(0.05, Math.min(0.95, pct));

export const parseOverlayText = (text: string): ParseResult => {
  const normalized = text.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, message: 'Type a command to generate an overlay.', suggestions };
  }

  const result: OverlayDef = { kind: 'thirds' };
  let summary = '';

  const setColorIfPresent = () => {
    for (const [keyword, value] of Object.entries(colorKeywords)) {
      if (normalized.includes(keyword)) {
        result.color = value;
        break;
      }
    }
  };

  if (/(third|grid)/.test(normalized)) {
    result.kind = 'thirds';
    summary = 'Rule of thirds grid';
    setColorIfPresent();
    return finalize(result, summary);
  }

  if (/(crosshair|reticle|center cross|diagonal cross)/.test(normalized)) {
    result.kind = 'crosshair';
    summary = 'Centered crosshair';
    setColorIfPresent();
    return finalize(result, summary);
  }

  if (/(diagonal|leading line)/.test(normalized)) {
    result.kind = 'diagonals';
    summary = 'Leading line diagonals';
    setColorIfPresent();
    return finalize(result, summary);
  }

  if (/(ellipse|oval)/.test(normalized)) {
    result.kind = 'ellipse';
    const widthMatch = normalized.match(/(\d{1,3})%\s*(?:wide|width)/);
    const heightMatch = normalized.match(/(\d{1,3})%\s*(?:tall|height)/);
    const wPct = widthMatch ? clampPct(parseInt(widthMatch[1], 10) / 100) : 0.6;
    const hPct = heightMatch ? clampPct(parseInt(heightMatch[1], 10) / 100) : 0.4;
    result.rect = { wPct, hPct };
    summary = `Centered ellipse ${(wPct * 100).toFixed(0)}% × ${(hPct * 100).toFixed(0)}%`;
    setColorIfPresent();
    return finalize(result, summary);
  }

  if (/golden ratio/.test(normalized)) {
    result.kind = 'goldenRatio';
    summary = 'Golden ratio grid';
    return finalize(result, summary);
  }

  if (/(frame|border)/.test(normalized)) {
    result.kind = 'frame';
    const insetMatch = normalized.match(/(\d{1,2})%\s*(?:inset|margin)/);
    const insetPct = insetMatch ? clampPct(parseInt(insetMatch[1], 10) / 100) : 0.1;
    result.insetPct = insetPct;
    summary = `Inset frame ${(insetPct * 100).toFixed(0)}%`;
    setColorIfPresent();
    return finalize(result, summary);
  }

  if (/(foreground|lower third)/.test(normalized)) {
    result.kind = 'foregroundEmphasis';
    summary = 'Foreground lower-third emphasis';
    setColorIfPresent();
    return finalize(result, summary);
  }

  if (/(horizon|level|tilt)/.test(normalized)) {
    result.kind = 'horizon';
    summary = 'Horizon level guide';
    setColorIfPresent();
    return finalize(result, summary);
  }

  return {
    ok: false,
    message: 'Could not understand that request.',
    suggestions
  };
};

const finalize = (def: OverlayDef, summary: string): ParseSuccess => ({
  ok: true,
  def,
  summary
});

export default parseOverlayText;
