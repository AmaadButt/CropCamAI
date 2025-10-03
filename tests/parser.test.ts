import { parseOverlayText } from '../custom/parseOverlayText';

describe('parseOverlayText', () => {
  it('parses rule of thirds command', () => {
    const result = parseOverlayText('add thirds grid');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.def.kind).toBe('thirds');
    }
  });

  it('parses ellipse dimensions', () => {
    const result = parseOverlayText('draw an ellipse 70% wide 40% tall');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.def.kind).toBe('ellipse');
      expect(result.def.rect?.wPct).toBeCloseTo(0.7);
      expect(result.def.rect?.hPct).toBeCloseTo(0.4);
    }
  });

  it('returns helpful suggestions when failing', () => {
    const result = parseOverlayText('unknown overlay please');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.suggestions.length).toBeGreaterThan(0);
    }
  });
});
