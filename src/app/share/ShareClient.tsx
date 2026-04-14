"use client";

import { useEffect, useState } from "react";

interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

const DEFAULT_SHARE: ShareConfig = {
  title: "微信分享 POC 演示",
  desc: "这是一个 Next.js 微信分享功能的概念验证页面",
  link: "",
  imgUrl: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4dd.png",
};

export default function ShareClient() {
  const [config, setConfig] = useState<ShareConfig>(DEFAULT_SHARE);
  const [status, setStatus] = useState("等待初始化...");
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  useEffect(() => {
    const url = window.location.href.split("#")[0];
    setConfig((prev) => ({ ...prev, link: url }));

    addLog(`当前页面 URL: ${url}`);
    addLog("开始请求微信 JS-SDK 签名...");

    fetch(`/api/wechat/signature?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          addLog(`❌ 签名请求失败: ${data.error}`);
          setStatus(`签名失败: ${data.error}`);
          return;
        }

        addLog(`✅ 签名获取成功`);
        addLog(`appId: ${data.appId}`);
        addLog(`timestamp: ${data.timestamp}`);
        addLog(`nonceStr: ${data.nonceStr}`);
        addLog(`signature: ${data.signature}`);

        if (typeof window.wx === "undefined") {
          addLog("⚠️ 微信 JS-SDK 未加载（非微信环境）");
          setStatus("非微信环境，无法初始化 JS-SDK");
          return;
        }

        window.wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: [
            "updateAppMessageShareData",
            "updateTimelineShareData",
            "onMenuShareAppMessage",
            "onMenuShareTimeline",
          ],
        });

        window.wx.ready(() => {
          addLog("✅ wx.config 配置成功 (wx.ready)");

          window.wx.updateAppMessageShareData({
            title: config.title,
            desc: config.desc,
            link: config.link || url,
            imgUrl: config.imgUrl,
          });

          window.wx.updateTimelineShareData({
            title: config.title,
            link: config.link || url,
            imgUrl: config.imgUrl,
          });

          setStatus("✅ 微信分享已配置成功！");
        });

        window.wx.error((res: { errMsg: string }) => {
          addLog(`❌ wx.config 失败: ${res.errMsg}`);
          setStatus(`配置失败: ${res.errMsg}`);
        });
      })
      .catch((err) => {
        addLog(`❌ 请求异常: ${err.message}`);
        setStatus(`请求异常: ${err.message}`);
      });
  }, []);

  const handleShareClick = () => {
    if (typeof window.wx !== "undefined") {
      window.wx.updateAppMessageShareData({
        title: config.title,
        desc: config.desc,
        link: config.link,
        imgUrl: config.imgUrl,
      });
      addLog("已更新分享内容");
    } else {
      addLog("⚠️ 非微信环境，无法调用分享接口");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            微信分享 POC
          </h1>
          <p className="text-gray-500">Next.js + 微信 JS-SDK 概念验证</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 分享配置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                分享标题
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                分享描述
              </label>
              <textarea
                value={config.desc}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, desc: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                分享链接
              </label>
              <input
                type="text"
                value={config.link}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, link: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                分享图标 URL
              </label>
              <input
                type="text"
                value={config.imgUrl}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, imgUrl: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleShareClick}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            更新分享内容
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            📊 状态
          </h2>
          <p
            className={`font-medium ${status.includes("✅") ? "text-green-600" : status.includes("❌") ? "text-red-600" : "text-yellow-600"}`}
          >
            {status}
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-green-400 mb-2">
            📝 调试日志
          </h2>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {debugLog.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无日志</p>
            ) : (
              debugLog.map((log, i) => (
                <p key={i} className="text-sm text-green-300 font-mono">
                  {log}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 使用说明</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>
              在 <code className="bg-yellow-100 px-1 rounded">.env.local</code>{" "}
              中填写微信 AppID 和 AppSecret
            </li>
            <li>此页面必须在微信内置浏览器中打开才能使用分享功能</li>
            <li>
              域名需在微信公众平台 → 公众号设置 → 功能设置中配置
              JS安全域名
            </li>
            <li>非微信环境下仅可查看签名流程，无法调用分享接口</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
