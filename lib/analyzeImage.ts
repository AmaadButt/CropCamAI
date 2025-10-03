import type { OverlayDef } from '../custom/OverlayDef';

/**
 * analyzeImage is a pluggable stub that can be replaced with a backend call.
 * Provide the captured image URI and return an array of overlay definitions.
 * When offline or when cloud analysis is disabled, return an empty array.
 *
 * Example implementation:
 * ```ts
 * export const analyzeImage = async (uri: string): Promise<OverlayDef[]> => {
 *   const response = await fetch('https://example.com/analyze', {
 *     method: 'POST',
 *     body: JSON.stringify({ uri })
 *   });
 *   const json = await response.json();
 *   return json.overlays as OverlayDef[];
 * };
 * ```
 */
export const analyzeImage = async (_uri: string): Promise<OverlayDef[]> => {
  return [];
};

export default analyzeImage;
