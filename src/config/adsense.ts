// Google AdSense Configuration
// Replace with your actual AdSense publisher ID and ad slot IDs

export const ADSENSE_CONFIG = {
  // Your AdSense publisher ID
  publisherId: 'ca-pub-3967165333331829',
  
  // Ad slot IDs for different placements
  adSlots: {
    // Horizontal ad between game and educational content
    gameBottom: '1234567890',
    
    // Rectangle ad on completion screen
    completionScreen: '0987654321',
    
    // You can add more ad slots here as needed
    // sidebar: 'XXXXXXXXXX',
    // header: 'XXXXXXXXXX',
  }
};

// Helper to check if ads should be displayed
export const shouldShowAds = () => {
  // You can add logic here to disable ads in development
  // return process.env.NODE_ENV === 'production';
  return true;
};