# Google AdSense Setup Guide

## Prerequisites
1. A Google AdSense account (apply at https://www.google.com/adsense/)
2. Your website must be live and comply with AdSense policies
3. Your site must have sufficient content and traffic

## Setup Instructions

### 1. Update AdSense Configuration

Edit `/src/config/adsense.ts` and replace the placeholder values:

```typescript
export const ADSENSE_CONFIG = {
  // Replace with your actual AdSense publisher ID
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // e.g., 'ca-pub-1234567890123456'
  
  adSlots: {
    // Replace with your actual ad unit IDs
    gameBottom: '1234567890',      // Your horizontal ad unit ID
    completionScreen: '0987654321', // Your rectangle ad unit ID
  }
};
```

### 2. Update HTML Script Tag

Edit `/index.html` and replace the publisher ID in the AdSense script:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
        crossorigin="anonymous"></script>
```

### 3. Create Ad Units in AdSense

1. Log in to your AdSense account
2. Go to Ads → By ad unit
3. Create the following ad units:
   - **Game Bottom Ad**: Display ad → Horizontal → Responsive
   - **Completion Screen Ad**: Display ad → Square → Responsive

### 4. Current Ad Placements

The app currently has two ad placements:

1. **Between Game and Educational Content** (`gameBottom`)
   - Horizontal responsive ad
   - Shows on the main game page
   - Non-intrusive placement below the game

2. **Completion Screen** (`completionScreen`)
   - Rectangle/square responsive ad
   - Shows after completing all daily puzzles
   - Celebrates the achievement without interrupting gameplay

### 5. Testing

- Ads won't show immediately after setup (can take 30-60 minutes)
- Use AdSense's "Ad Preview" tool to test ad placements
- Check browser console for any ad loading errors

### 6. Compliance Notes

Ensure your implementation follows AdSense policies:
- Don't click your own ads
- Don't encourage users to click ads
- Maintain a good user experience
- Keep ads clearly labeled as advertisements
- Don't place ads too close to interactive elements

### 7. Adding More Ad Placements

To add more ads, update the configuration:

1. Add new slot ID to `/src/config/adsense.ts`
2. Import and use the `GoogleAd` component where needed:

```tsx
<GoogleAd 
  adSlot={ADSENSE_CONFIG.adSlots.yourNewSlot}
  adFormat="auto" // or "horizontal", "vertical", "rectangle"
  style={{ minHeight: '90px' }}
/>
```

### 8. Disable Ads in Development

To disable ads during development, update `/src/config/adsense.ts`:

```typescript
export const shouldShowAds = () => {
  return process.env.NODE_ENV === 'production';
};
```