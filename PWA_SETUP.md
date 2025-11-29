# Progressive Web App (PWA) Setup

This project has been configured as a Progressive Web App (PWA) with full iOS Safari support.

## Features

✅ **Web App Manifest** - Defines app metadata, icons, and display mode  
✅ **Service Worker** - Enables offline functionality and caching  
✅ **iOS Safari Support** - Full-screen app experience when added to home screen  
✅ **App Icons** - Multiple sizes for all devices and platforms  
✅ **Theme Colors** - Custom theme color for browser UI  

## iOS "Add to Home Screen" Support

When users visit your app on iOS Safari, they can:

1. Tap the **Share** button
2. Select **"Add to Home Screen"**
3. The app will appear with a custom icon
4. Launch in full-screen mode (no Safari URL bar)
5. Feel like a native app experience

### iOS-Specific Features

- **Full-screen mode** - No browser UI when launched from home screen
- **Custom app icon** - Uses the FinMate logo
- **Status bar styling** - Black translucent status bar
- **Standalone display** - App runs independently from Safari

## HTTPS Requirement

⚠️ **Important**: PWAs require HTTPS to work properly. The service worker and many PWA features will not work over HTTP.

- **Development**: Service worker is disabled in development mode
- **Production**: Ensure your hosting provider supports HTTPS (Vercel, Netlify, etc. provide this automatically)

## Files Created/Modified

### New Files
- `public/manifest.json` - Web app manifest
- `public/icon.svg` - Source icon for generating PNGs
- `public/icon-*.png` - Generated icons in various sizes
- `public/apple-touch-icon.png` - iOS home screen icon
- `components/pwa-meta.tsx` - Component for iOS meta tags
- `scripts/generate-icons.js` - Script to generate icons from SVG

### Modified Files
- `next.config.ts` - Added PWA configuration
- `app/layout.tsx` - Added PWA metadata and meta tags
- `package.json` - Added icon generation script
- `.gitignore` - Added PWA-generated files

## Generating Icons

If you need to regenerate icons from the SVG source:

```bash
npm run generate-icons
```

This will create all required icon sizes in the `public` directory.

## Testing PWA Features

### Desktop (Chrome/Edge)
1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** and **Service Workers** sections
4. Use **Lighthouse** to audit PWA features

### iOS Safari
1. Open the app in Safari on iOS
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name if needed
5. Tap **Add**
6. Launch from home screen to see full-screen mode

### Android Chrome
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select **"Add to Home Screen"** or **"Install App"**
4. Confirm installation

## Configuration

### Manifest Settings
The manifest is located at `public/manifest.json`. Key settings:

- **display**: `"standalone"` - Full-screen app experience
- **theme_color**: `"#8b5cf6"` - Browser UI theme color
- **background_color**: `"#0a0a0a"` - Splash screen background
- **orientation**: `"portrait-primary"` - Preferred orientation

### Service Worker
Configured in `next.config.ts`:

- **Disabled in development** - Only active in production
- **NetworkFirst strategy** - Tries network first, falls back to cache
- **Auto-update** - New service worker activates immediately

## Customization

### Changing App Colors
1. Update `theme_color` in `public/manifest.json`
2. Update `themeColor` in `app/layout.tsx` metadata
3. Update `msapplication-TileColor` in `components/pwa-meta.tsx`

### Changing App Icon
1. Replace `public/icon.svg` with your custom icon
2. Run `npm run generate-icons` to regenerate PNGs
3. Ensure the SVG is square and at least 512x512px

### Changing App Name
1. Update `name` and `short_name` in `public/manifest.json`
2. Update `title` in `app/layout.tsx` metadata
3. Update `apple-mobile-web-app-title` in `components/pwa-meta.tsx`

## Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS (or localhost for development)
- Check browser console for errors
- Clear browser cache and reload

### Icons Not Showing
- Verify icons exist in `public/` directory
- Check manifest.json icon paths are correct
- Clear browser cache

### iOS Not Showing "Add to Home Screen"
- Ensure manifest.json is accessible
- Check that all required meta tags are present
- Verify HTTPS is enabled

## Resources

- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [iOS PWA Guidelines](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)

