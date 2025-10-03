import { OVERLAY_REGISTRY } from '../overlays';

describe('overlay registry', () => {
  it('every entry has id, label, and component', () => {
    OVERLAY_REGISTRY.forEach(entry => {
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
      expect(typeof entry.Component).toBe('function');
    });
  });
});
