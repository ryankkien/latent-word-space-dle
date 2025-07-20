import { useEffect } from 'react';
import { ADSENSE_CONFIG, shouldShowAds } from '../config/adsense';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export function GoogleAd({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style 
}: GoogleAdProps) {
  useEffect(() => {
    if (shouldShowAds()) {
      try {
        // Push the ad to AdSense
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error('Error loading ad:', error);
      }
    }
  }, []);

  // Don't render if ads are disabled
  if (!shouldShowAds()) {
    return null;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{
        display: 'block',
        ...style
      }}
      data-ad-client={ADSENSE_CONFIG.publisherId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    />
  );
}