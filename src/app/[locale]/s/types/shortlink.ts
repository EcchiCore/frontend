// types/shortlink.ts

export interface AdNetwork {
  id: string;
  name: string;
  type: AdNetworkType;
  config: AdNetworkConfig;
}

export enum AdNetworkType {
  POPUNDER = 'popunder',
  SMARTLINK = 'smartlink',
  INTERSTITIAL = 'interstitial',
  REDIRECT = 'redirect'
}

export interface AdNetworkConfig {
  script?: string;
  redirectUrl?: string;
  zoneId?: string;
  publisherId?: string;
  customParams?: Record<string, string>;
}

export interface RedirectResponse {
  destinationUrl: string;
  adNetwork: AdNetwork;
  timerDuration: number;
  country: string;
  success: boolean;
  message?: string;
}

export interface ShortlinkPageProps {
  redirectData: RedirectResponse;
  slug: string;
  error?: string;
}