import Script from "next/script";
import { useEffect } from "react";

// Declare the interface in the global scope
declare global {
  interface Window {
    ad_idzone?: string;
    ad_popup_fallback?: boolean;
    ad_popup_force?: boolean;
    ad_chrome_enabled?: boolean;
    ad_new_tab?: boolean;
    ad_frequency_period?: number;
    ad_frequency_count?: number;
    ad_trigger_method?: number;
    ad_trigger_delay?: number;
    ad_capping_enabled?: boolean;
  }
}

const AdScriptLoader = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.ad_idzone = "5507184";
      window.ad_popup_fallback = false;
      window.ad_popup_force = false;
      window.ad_chrome_enabled = true;
      window.ad_new_tab = true;
      window.ad_frequency_period = 60;
      window.ad_frequency_count = 3;
      window.ad_trigger_method = 3;
      window.ad_trigger_delay = 5;
      window.ad_capping_enabled = true;
    }
  }, []);

  return (
    <Script
      src="https://a.pemsrv.com/popunder1000.js"
      strategy="afterInteractive"
      onError={(e) => {
        console.error('Error loading ad script:', e);
      }}
    />
  );
};

export default AdScriptLoader;