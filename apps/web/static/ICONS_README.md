# PWA Icons

This app requires the following icon files for PWA functionality:

## Required Icons

Place these files in the `/static` directory:

1. **icon-192.png** (192x192 pixels)
   - Standard PWA icon for mobile devices
   - Used for Android home screen and app drawer

2. **icon-512.png** (512x512 pixels)
   - Large PWA icon for various contexts
   - Used for splash screens and larger displays

3. **icon-maskable-192.png** (192x192 pixels)
   - Maskable icon that follows Android's adaptive icon guidelines
   - Should have important content in the safe zone (center 80%)
   - Background should extend to full edges

4. **icon-maskable-512.png** (512x512 pixels)
   - Large maskable icon
   - Same safe zone requirements as 192px version

## Icon Design Guidelines

### Colors
- Background: `#e6e1c5` (primary app background)
- Primary: `#395c6b` (heading color)
- Accent: `#80a4ed` (accent color)

### Safe Zone for Maskable Icons
- Keep important content (logo, text) within the center 80% diameter
- The outer 20% may be cropped on some devices
- Use a full-bleed background that extends to all edges

## Tools for Generating PWA Icons

- **PWA Asset Generator**: `npm install -g pwa-asset-generator`
  ```bash
  pwa-asset-generator [source-image] ./static --icon-only --path-override .
  ```

- **PWABuilder Image Generator**: https://www.pwabuilder.com/imageGenerator

- **RealFaviconGenerator**: https://realfavicongenerator.net/

## Verification

After adding icons, verify they appear correctly:
1. Build the app: `npm run build`
2. Deploy to production
3. Test with Lighthouse PWA audit
4. Check manifest in Chrome DevTools > Application > Manifest
