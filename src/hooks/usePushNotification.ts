'use client';

import { useState, useEffect, useCallback } from 'react';
import { VAPID_PUBLIC_KEY } from '@/lib/config';

export interface BrowserInfo {
  name: string;
  displayName: string;
  isSupported: boolean;
  isInApp: boolean;
  isUnknown: boolean;
  platform: 'android' | 'ios' | 'desktop';
  message?: string;
  isBrave?: boolean;
  isEdge?: boolean;
  isIOSSafari?: boolean;
  isIOSChrome?: boolean;
  needsSafari?: boolean;
  inAppName?: string;
}

interface UsePushNotificationReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  isIOS: boolean;
  isStandalone: boolean;
  needsInstall: boolean;
  browserInfo: BrowserInfo;
}

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([promise, timeout]);
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

async function checkIsBrave(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } };
  if (nav.brave && typeof nav.brave.isBrave === 'function') {
    try {
      return await nav.brave.isBrave();
    } catch {
      return true;
    }
  }
  return false;
}

function getPlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

// ตรวจสอบว่าเป็น Standalone mode (PWA) หรือไม่
function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const navStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  if (navStandalone === true) return true;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
  if (document.referrer.includes('android-app://')) return true;
  return false;
}

// ตรวจสอบ In-App Browser จาก User Agent (เฉพาะ patterns ที่ชัดเจน)
function detectInAppByUA(ua: string): string | null {
  // ถ้า URL มี openExternalBrowser=1 → เปิดจาก Safari/Chrome แล้ว ไม่ใช่ in-app
  if (typeof window !== 'undefined' && window.location.search.includes('openExternalBrowser=1')) {
    return null;
  }
  
  const uaLower = ua.toLowerCase();
  
  // รายการ In-App patterns ที่มีใน UA ชัดเจน
  const patterns: { test: (ua: string) => boolean; name: string }[] = [
    // LINE - มี "Line/" ใน UA
    { test: (ua) => /line\/[\d.]+/.test(ua) || ua.includes(' line ') || ua.includes('liff'), name: 'LINE' },
    
    // Facebook - มี FBAV หรือ FBAN ใน UA
    { test: (ua) => ua.includes('fbav/') || ua.includes('fban/') || ua.includes('fb_iab') || ua.includes('[fban') || ua.includes('[fbav'), name: 'Facebook' },
    
    // Messenger - มี messenger ใน UA
    { test: (ua) => ua.includes('messenger/') || /\[fb.*messenger\]/.test(ua), name: 'Messenger' },
    
    // Instagram - มี Instagram ใน UA
    { test: (ua) => ua.includes('instagram'), name: 'Instagram' },
    
    // TikTok
    { test: (ua) => ua.includes('tiktok') || ua.includes('bytedance') || ua.includes('musical_ly'), name: 'TikTok' },
    
    // Twitter/X
    { test: (ua) => ua.includes('twitter/') || ua.includes('twitterandroid'), name: 'Twitter/X' },
    
    // WhatsApp
    { test: (ua) => ua.includes('whatsapp/'), name: 'WhatsApp' },
    
    // WeChat
    { test: (ua) => ua.includes('micromessenger/') || ua.includes('wechat'), name: 'WeChat' },
    
    // Snapchat
    { test: (ua) => ua.includes('snapchat'), name: 'Snapchat' },
    
    // LinkedIn
    { test: (ua) => ua.includes('linkedin'), name: 'LinkedIn' },
    
    // Pinterest
    { test: (ua) => ua.includes('pinterest/'), name: 'Pinterest' },
    
    // Discord
    { test: (ua) => ua.includes('discord/'), name: 'Discord' },
    
    // Slack
    { test: (ua) => ua.includes('slack/'), name: 'Slack' },
    
    // Zalo
    { test: (ua) => ua.includes('zalo/'), name: 'Zalo' },
    
    // KakaoTalk
    { test: (ua) => ua.includes('kakaotalk'), name: 'KakaoTalk' },
    
    // Viber
    { test: (ua) => ua.includes('viber/'), name: 'Viber' },
    
    // Shopping Apps
    { test: (ua) => ua.includes('shopee'), name: 'Shopee' },
    { test: (ua) => ua.includes('lazada'), name: 'Lazada' },
    { test: (ua) => ua.includes('grab/'), name: 'Grab' },
    
    // Thai Banking
    { test: (ua) => ua.includes('kplus') || ua.includes('k plus'), name: 'K PLUS' },
    { test: (ua) => ua.includes('scbeasy'), name: 'SCB Easy' },
    { test: (ua) => ua.includes('truemoney'), name: 'TrueMoney' },
  ];
  
  for (const { test, name } of patterns) {
    if (test(uaLower)) {
      return name;
    }
  }
  
  return null;
}

// ตรวจสอบ Telegram แยกต่างหาก (เพราะ UA อาจไม่ชัดเจน)
function detectTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  
  // ถ้า URL มี openExternalBrowser=1 → เปิดจาก Safari/Chrome แล้ว ไม่ใช่ in-app
  if (window.location.search.includes('openExternalBrowser=1')) return false;
  
  // ตรวจสอบจาก window object - เฉพาะ TelegramWebviewProxy (ที่มีเฉพาะใน WebView)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (win.TelegramWebviewProxy || win.TelegramWebview) return true;
  
  // ตรวจสอบจาก UA - ต้องมี pattern ชัดเจน
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('telegram') || ua.includes('tgweb')) return true;
  
  return false;
}

// ตรวจสอบว่าเป็น Android WebView หรือไม่
function isAndroidWebView(ua: string): boolean {
  const uaLower = ua.toLowerCase();
  if (uaLower.includes('; wv)') || uaLower.includes(';wv)') || uaLower.includes(' wv)')) return true;
  if (uaLower.includes('android') && uaLower.includes('chrome') && !uaLower.includes('safari')) return true;
  return false;
}

// ตรวจสอบว่าเป็น Safari แท้บน iOS หรือไม่
// Safari แท้จะมี Safari/xxx และ Version/xxx และไม่มี in-app patterns
function isRealIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  if (!checkIsIOS()) return false;
  
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();
  
  // ตรวจสอบ Telegram ก่อน (window object)
  if (detectTelegram()) return false;
  
  // ตรวจสอบ in-app browser จาก UA
  if (detectInAppByUA(ua)) return false;
  
  // Safari แท้จะมี "Safari/" และ "Version/" ใน UA
  const hasSafari = /safari\/[\d.]+/.test(uaLower);
  const hasVersion = /version\/[\d.]+/.test(uaLower);
  
  // ต้องไม่ใช่ browser อื่นบน iOS
  const noCrios = !uaLower.includes('crios');     // Chrome iOS
  const noFxios = !uaLower.includes('fxios');     // Firefox iOS
  const noEdgios = !uaLower.includes('edgios');   // Edge iOS
  const noOpios = !uaLower.includes('opios');     // Opera iOS
  const noOpt = !uaLower.includes('opt/');        // Opera Touch
  const noGsa = !uaLower.includes('gsa/');        // Google Search App
  const noBrave = !uaLower.includes('brave');     // Brave iOS
  const noDuckDuckGo = !uaLower.includes('duckduckgo');
  const noFocus = !uaLower.includes('focus/');    // Firefox Focus
  
  // Safari แท้ต้องมีทั้ง Safari และ Version และไม่ใช่ browser อื่น
  const isSafariUA = hasSafari && hasVersion && 
                      noCrios && noFxios && noEdgios && noOpios && 
                      noOpt && noGsa && noBrave && noDuckDuckGo && noFocus;
  
  return isSafariUA;
}

// ตรวจสอบว่าเป็น Chrome บน iOS หรือไม่
function isIOSChrome(ua: string): boolean {
  const uaLower = ua.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(uaLower);
  if (!isIOS) return false;
  
  // ต้องไม่ใช่ in-app browser
  if (detectInAppByUA(ua)) return false;
  if (detectTelegram()) return false;
  
  return uaLower.includes('crios');
}

// ตรวจสอบว่าเป็น Chrome แท้บน Android หรือไม่
function isRealAndroidChrome(ua: string): boolean {
  const uaLower = ua.toLowerCase();
  
  if (!uaLower.includes('android')) return false;
  if (detectInAppByUA(ua)) return false;
  if (isAndroidWebView(ua)) return false;
  
  const hasChrome = /chrome\/[\d.]+/.test(uaLower);
  const hasSafari = uaLower.includes('safari/');
  const hasMobile = uaLower.includes('mobile');
  
  // ต้องไม่ใช่ browser อื่น
  const noEdge = !uaLower.includes('edg/') && !uaLower.includes('edge/');
  const noOpera = !uaLower.includes('opr/') && !uaLower.includes('opera');
  const noSamsung = !uaLower.includes('samsungbrowser');
  const noFirefox = !uaLower.includes('firefox');
  
  // ต้องไม่ใช่ browser ที่ไม่รองรับ Push Notification
  const noVivo = !uaLower.includes('vivobrowser') && !uaLower.includes('vivo browser');
  const noOppo = !uaLower.includes('heytapbrowser') && !uaLower.includes('oppobrowser') && !uaLower.includes('coloros');
  const noMi = !uaLower.includes('miuibrowser') && !uaLower.includes('mibrowser');
  const noHuawei = !uaLower.includes('huaweibrowser') && !uaLower.includes('hmscore');
  const noUC = !uaLower.includes('ucbrowser') && !uaLower.includes('uc browser');
  const noQQ = !uaLower.includes('mqqbrowser') && !uaLower.includes('qq/') && !uaLower.includes('qqbrowser');
  const noBaidu = !uaLower.includes('baidubrowser') && !uaLower.includes('baidu');
  const noDuckDuckGo = !uaLower.includes('duckduckgo');
  const noRealme = !uaLower.includes('realmebrowser');
  const noOnePlus = !uaLower.includes('oneplusbrowser');
  
  return hasChrome && hasSafari && hasMobile && 
         noEdge && noOpera && noSamsung && noFirefox &&
         noVivo && noOppo && noMi && noHuawei && noUC && noQQ && noBaidu && noDuckDuckGo && noRealme && noOnePlus;
}

async function detectBrowser(): Promise<BrowserInfo> {
  if (typeof window === 'undefined') {
    return { 
      name: 'unknown', 
      displayName: 'Unknown',
      isSupported: false, 
      isInApp: false,
      isUnknown: true,
      platform: 'desktop'
    };
  }
  
  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();
  const platform = getPlatform();
  const isIOS = checkIsIOS();
  
  // ===== 1. ตรวจสอบ In-app Browser ก่อน =====
  
  // ตรวจสอบ Telegram ก่อน (เพราะ UA อาจเหมือน Safari)
  if (detectTelegram()) {
    return { 
      name: 'inapp', 
      displayName: `Unknown (${platform})`,
      isSupported: false, 
      isInApp: true,
      isUnknown: true,
      platform,
      inAppName: 'Telegram',
      needsSafari: isIOS,
      message: 'กรุณาเปิดใน Browser ที่รองรับ'
    };
  }
  
  // ตรวจสอบ In-app อื่นๆ จาก UA
  const uaInApp = detectInAppByUA(ua);
  if (uaInApp) {
    return { 
      name: 'inapp', 
      displayName: `Unknown (${platform})`,
      isSupported: false, 
      isInApp: true,
      isUnknown: true,
      platform,
      inAppName: uaInApp,
      needsSafari: isIOS,
      message: 'กรุณาเปิดใน Browser ที่รองรับ'
    };
  }
  
  // ===== 2. iOS =====
  if (isIOS) {
    // Chrome บน iOS
    if (isIOSChrome(ua)) {
      return { 
        name: 'Chrome', 
        displayName: 'Chrome (iOS)',
        isSupported: true, 
        isInApp: false, 
        isUnknown: false,
        platform: 'ios',
        isIOSChrome: true,
        message: 'กดปุ่ม Share (มุมขวาบน) แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    
    // Safari แท้บน iOS
    if (isRealIOSSafari()) {
      return { 
        name: 'Safari', 
        displayName: 'Safari (iOS)',
        isSupported: true, 
        isInApp: false, 
        isUnknown: false,
        platform: 'ios',
        isIOSSafari: true,
        message: 'กดปุ่ม Share (ด้านล่าง) แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    
    // iOS browser อื่นๆ - ไม่รองรับ ต้องเปิดใน Safari
    return { 
      name: 'unknown', 
      displayName: 'Unknown (iOS)',
      isSupported: false, 
      isInApp: false, 
      isUnknown: true,
      platform: 'ios',
      needsSafari: true,
      message: 'กรุณาเปิดใน Safari'
    };
  }
  
  // ===== 3. Android =====
  if (platform === 'android') {
    // ตรวจสอบ WebView
    if (isAndroidWebView(ua)) {
      return { 
        name: 'webview', 
        displayName: 'Unknown (android)',
        isSupported: false, 
        isInApp: true,
        isUnknown: true,
        platform: 'android',
        message: 'กรุณาเปิดใน Browser ที่รองรับ'
      };
    }
    
    // Brave
    const isBrave = await checkIsBrave();
    if (isBrave) {
      return { 
        name: 'Brave', 
        displayName: 'Brave (android)',
        isSupported: true, 
        isInApp: false,
        isUnknown: false,
        platform: 'android',
        isBrave: true
      };
    }
    
    // Edge
    if (uaLower.includes('edg/') || uaLower.includes('edge/')) {
      return { 
        name: 'Edge', 
        displayName: 'Edge (android)',
        isSupported: true, 
        isInApp: false,
        isUnknown: false,
        platform: 'android',
        isEdge: true 
      };
    }
    
    // Opera
    if (uaLower.includes('opr/') || uaLower.includes('opera')) {
      return { 
        name: 'Opera', 
        displayName: 'Opera (android)',
        isSupported: true, 
        isInApp: false,
        isUnknown: false,
        platform: 'android'
      };
    }
    
    // Samsung Internet
    if (uaLower.includes('samsungbrowser')) {
      return { 
        name: 'Samsung Internet', 
        displayName: 'Samsung (android)',
        isSupported: true, 
        isInApp: false,
        isUnknown: false,
        platform: 'android'
      };
    }
    
    // Firefox
    if (uaLower.includes('firefox')) {
      return { 
        name: 'Firefox', 
        displayName: 'Firefox (android)',
        isSupported: true, 
        isInApp: false,
        isUnknown: false,
        platform: 'android'
      };
    }
    
    // Chrome แท้
    if (isRealAndroidChrome(ua)) {
      return { 
        name: 'Chrome', 
        displayName: 'Chrome (android)',
        isSupported: true, 
        isInApp: false,
        isUnknown: false,
        platform: 'android'
      };
    }
    
    // Android browser อื่นๆ - ไม่รองรับ
    return { 
      name: 'unknown', 
      displayName: 'Unknown (android)',
      isSupported: false, 
      isInApp: false,
      isUnknown: true,
      platform: 'android',
      message: 'กรุณาเปิดใน Browser ที่รองรับ'
    };
  }
  
  // ===== 4. Desktop =====
  const isBrave = await checkIsBrave();
  if (isBrave) {
    return { 
      name: 'Brave', 
      displayName: 'Brave (desktop)',
      isSupported: true, 
      isInApp: false,
      isUnknown: false,
      platform: 'desktop',
      isBrave: true
    };
  }
  
  if (uaLower.includes('edg/') || uaLower.includes('edge/')) {
    return { 
      name: 'Edge', 
      displayName: 'Edge (desktop)',
      isSupported: true, 
      isInApp: false,
      isUnknown: false,
      platform: 'desktop',
      isEdge: true 
    };
  }
  
  if (uaLower.includes('opr/') || uaLower.includes('opera')) {
    return { 
      name: 'Opera', 
      displayName: 'Opera (desktop)',
      isSupported: true, 
      isInApp: false,
      isUnknown: false,
      platform: 'desktop'
    };
  }
  
  if (uaLower.includes('firefox')) {
    return { 
      name: 'Firefox', 
      displayName: 'Firefox (desktop)',
      isSupported: true, 
      isInApp: false,
      isUnknown: false,
      platform: 'desktop'
    };
  }
  
  if (uaLower.includes('chrome') && !uaLower.includes('edg') && !uaLower.includes('opr')) {
    return { 
      name: 'Chrome', 
      displayName: 'Chrome (desktop)',
      isSupported: true, 
      isInApp: false,
      isUnknown: false,
      platform: 'desktop'
    };
  }
  
  if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
    return { 
      name: 'Safari', 
      displayName: 'Safari (desktop)',
      isSupported: true, 
      isInApp: false,
      isUnknown: false,
      platform: 'desktop'
    };
  }
  
  // ตรวจสอบ API
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;
  
  if (hasServiceWorker && hasPushManager && hasNotification) {
    return { 
      name: 'unknown', 
      displayName: `Unknown (${platform})`,
      isSupported: true, 
      isInApp: false,
      isUnknown: true,
      platform
    };
  }
  
  return { 
    name: 'unknown', 
    displayName: `Unknown (${platform})`,
    isSupported: false, 
    isInApp: false,
    isUnknown: true,
    platform,
    message: 'Browser นี้ไม่รองรับ' 
  };
}

function checkIsStandalone(): boolean {
  return isStandaloneMode();
}

async function checkBravePushEnabled(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    return true;
  } catch {
    return false;
  }
}

export function usePushNotification(adminToken?: string): UsePushNotificationReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    name: 'unknown',
    displayName: 'Unknown',
    isSupported: false,
    isInApp: false,
    isUnknown: true,
    platform: 'desktop'
  });

  const needsInstall = Boolean(isIOS && !isStandalone && (browserInfo.isIOSSafari || browserInfo.isIOSChrome));

  useEffect(() => {
    const init = async () => {
      const ios = checkIsIOS();
      const standalone = checkIsStandalone();
      const browser = await detectBrowser();
      
      setIsIOS(ios);
      setIsStandalone(standalone);
      setBrowserInfo(browser);
      
      if (!browser.isSupported || (ios && !standalone && (browser.isIOSSafari || browser.isIOSChrome))) {
        setIsSupported(false);
        return;
      }
      
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setIsSupported(false);
        return;
      }
      
      setIsSupported(true);
      setPermission(Notification.permission);
      
      try {
        const reg = await withTimeout(
          navigator.serviceWorker.register('/sw.js', { scope: '/' }),
          10000,
          'Service worker timeout'
        );
        setRegistration(reg);
        await withTimeout(navigator.serviceWorker.ready, 10000, 'Service worker ready timeout');
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Service worker error:', err);
        setIsSupported(false);
      }
    };
    
    init();
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await withTimeout(navigator.serviceWorker.ready, 10000, 'Service worker ไม่พร้อม');
      
      if (Notification.permission === 'denied') {
        setError('การแจ้งเตือนถูกบล็อก');
        setPermission('denied');
        setIsLoading(false);
        return;
      }
      
      let perm: NotificationPermission = Notification.permission;
      if (perm !== 'granted') {
        perm = await Notification.requestPermission();
      }
      
      setPermission(perm);
      
      if (perm !== 'granted') {
        setError('กรุณากดอนุญาต (Allow)');
        setIsLoading(false);
        return;
      }
      
      if (browserInfo.isBrave) {
        const ok = await checkBravePushEnabled();
        if (!ok) {
          setError('Brave: เปิด "Use Google Services for Push Messaging"');
          setIsLoading(false);
          return;
        }
      }
      
      const subscription = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        }),
        30000,
        'หมดเวลา กรุณาลองใหม่'
      );
      
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) throw new Error('สร้าง keys ไม่ได้');
      
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
            auth: btoa(String.fromCharCode(...new Uint8Array(authKey)))
          },
          userAgent: navigator.userAgent,
          adminToken: adminToken || undefined
        })
      });
      
      if (!response.ok) throw new Error('บันทึกไม่สำเร็จ');
      
      setIsSubscribed(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, [registration, adminToken, browserInfo.isBrave]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    setIsLoading(true);
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }
      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    isIOS,
    isStandalone,
    needsInstall,
    browserInfo
  };
}