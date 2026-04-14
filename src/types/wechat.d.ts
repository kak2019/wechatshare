interface WxConfig {
  debug?: boolean;
  appId: string;
  timestamp: string;
  nonceStr: string;
  signature: string;
  jsApiList: string[];
}

interface ShareData {
  title: string;
  desc?: string;
  link: string;
  imgUrl: string;
}

interface WxError {
  errMsg: string;
}

interface WxSdk {
  config(config: WxConfig): void;
  ready(callback: () => void): void;
  error(callback: (res: WxError) => void): void;
  updateAppMessageShareData(data: ShareData, success?: () => void): void;
  updateTimelineShareData(data: ShareData, success?: () => void): void;
  onMenuShareAppMessage(data: ShareData): void;
  onMenuShareTimeline(data: ShareData): void;
}

declare global {
  interface Window {
    wx: WxSdk;
  }
}

export {};
