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
  checkJsApi(options: {
    jsApiList: string[];
    success?: (res: { checkResult?: Record<string, boolean> }) => void;
    fail?: (res: WxError) => void;
  }): void;
  updateAppMessageShareData(data: ShareData & {
    success?: () => void;
    fail?: (res: WxError) => void;
  }): void;
  updateTimelineShareData(data: Omit<ShareData, "desc"> & {
    success?: () => void;
    fail?: (res: WxError) => void;
  }): void;
  onMenuShareAppMessage(data: ShareData): void;
  onMenuShareTimeline(data: Omit<ShareData, "desc">): void;
}

declare global {
  interface Window {
    wx: WxSdk;
  }
}

export {};
