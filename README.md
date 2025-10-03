# CropCamAI

CropCamAI is an Expo Go–compatible camera toolkit that blends manual framing guides, customizable SVG overlays, and natural-language commands. It lets creators capture well-composed photos, tweak overlays on imported images, and store favorite presets for quick reuse.

## Features

- 📸 **Camera-first workflow** with live preview, photo capture, pinch/slider zoom, tap-to-focus feedback, flash/white balance controls, and aspect-ratio letterboxing.
- 🧭 **Overlay system** powered by `react-native-svg` that includes thirds, crosshair, leading lines, golden ratio, horizon level (with accelerometer), framed border, ellipse, and foreground guides.
- 💬 **Natural-language overlay generator** with clear success/error summaries and the ability to store parsed overlays as reusable presets.
- 🖼️ **Image importer & guide lab** to apply presets, adjust horizon angles manually, and optionally trigger pluggable cloud analysis.
- 💾 **Persistent settings** via AsyncStorage for overlay styling, flash, zoom, and the last used overlay.
- ♿ **Accessible UI** with Safe Area support, high-contrast controls, descriptive labels, and haptic capture feedback.
- 📤 **Preview tools** to review, save, share, or retake captures, plus optional GPS metadata.

## Getting Started

If starting from scratch:

```bash
npx create-expo-app -t expo-template-blank-typescript expo-camera-overlays
cd expo-camera-overlays
```

Replace the generated files with the ones in this repository (or clone this repo directly), then install dependencies:

```bash
npm install
npx expo install expo-camera expo-media-library expo-sharing expo-haptics expo-location expo-image-picker expo-sensors expo-router react-native-svg @react-native-async-storage/async-storage react-native-gesture-handler react-native-safe-area-context
```

Run quality checks:

```bash
npm test
npm run lint
```

Start the development server (tunnel is handy for physical devices):

```bash
npx expo start
# or
npx expo start --tunnel
```

Scan the QR code with Expo Go to launch CropCamAI.

## Usage Tips

- Grant camera and media permissions on first launch; a Settings shortcut is provided if access is denied.
- Tap the **⚙︎ Settings** button to adjust overlay color, opacity, thickness, zoom, flash, and white balance. Exposure compensation appears only if the device supports it.
- Use pinch or the zoom slider for fine control, and toggle **3:4 / 9:16** to letterbox the preview safely.
- Try natural-language requests like `draw a centered oval 70% wide, 40% tall` or `show horizon level`; save successful parses as presets for quick access.
- The **Guides** button opens the importer: add manual overlays, adjust the horizon angle, and optionally enable cloud analysis (stubbed in `lib/analyzeImage.ts`).
- Captured photos appear in the preview screen where you can save to the Camera roll, share (when supported), or retake.

## Accessibility & Responsiveness

- Buttons include accessibility labels/roles and generous hit-slop.
- Safe area insets are respected to keep controls reachable on modern devices.
- Colors meet WCAG contrast expectations for both light and dark backgrounds.
- Orientation changes keep the camera frame centered with dynamic letterboxing.

## Extending the Overlay System

- Register new overlays by exporting a component in `overlays/` and adding it to the `OVERLAY_REGISTRY` in `overlays/index.ts`.
- Overlay components receive `OverlayProps` with dimensions, color, opacity, thickness, and safe-area insets for consistent rendering.
- The natural-language parser lives in `custom/parseOverlayText.ts`; extend it with additional keywords and summaries.

## Notes

- Capture dimensions are device dependent. The preview frame letterboxes/pillarboxes to maintain the requested aspect ratio, but the final image may still follow the camera sensor ratio.
- The stubbed `analyzeImage` function returns an empty array. Connect it to your backend to enable cloud-based guides. Consider `expo-image-manipulator` if post-capture cropping is required in future iterations.
- All dependencies are Expo Go compatible—no native modules or EAS build steps required.

Happy shooting! 📷
