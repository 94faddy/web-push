'use client';

import { useState, useEffect, useCallback } from 'react';
import { VAPID_PUBLIC_KEY } from '@/lib/config';

interface BrowserInfo {
  name: string;
  isSupported: boolean;
  isInApp: boolean;
  message?: string;
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

// แก้ไข: return ArrayBuffer แทน Uint8Array
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

// ตรวจสอบ Browser อย่างละเอียด
function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return { name: 'unknown', isSupported: false, isInApp: false };
  }
  
  const ua = navigator.userAgent.toLowerCase();
  
  // ตรวจสอบ In-app Browser (ไม่รองรับ Push)
  if (ua.includes('line')) {
    return { name: 'LINE', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Safari แทน กดที่ ⋮ แล้วเลือก "เปิดใน Browser"' };
  }
  if (ua.includes('fbav') || ua.includes('fban') || ua.includes('fb_iab')) {
    return { name: 'Facebook', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Safari แทน กดที่ ⋮ แล้วเลือก "เปิดใน Browser"' };
  }
  if (ua.includes('instagram')) {
    return { name: 'Instagram', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Safari แทน กดที่ ⋮ แล้วเลือก "เปิดใน Browser"' };
  }
  if (ua.includes('twitter') || ua.includes('twitterandroid')) {
    return { name: 'Twitter/X', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Safari แทน' };
  }
  if (ua.includes('tiktok')) {
    return { name: 'TikTok', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Safari แทน' };
  }
  if (ua.includes('snapchat')) {
    return { name: 'Snapchat', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Safari แทน' };
  }
  if (ua.includes('wv') && ua.includes('android')) {
    return { name: 'WebView', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome แทน' };
  }
  
  // ตรวจสอบ Browser ที่ไม่รองรับ Push
  if (ua.includes('ucbrowser') || ua.includes('ucweb')) {
    return { name: 'UC Browser', isSupported: false, isInApp: false, message: 'UC Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome หรือ Firefox แทน' };
  }
  if (ua.includes('miuibrowser')) {
    return { name: 'Mi Browser', isSupported: false, isInApp: false, message: 'Mi Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome แทน' };
  }
  if (ua.includes('vivobrowser')) {
    return { name: 'Vivo Browser', isSupported: false, isInApp: false, message: 'Vivo Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome แทน' };
  }
  if (ua.includes('oppobrowser')) {
    return { name: 'Oppo Browser', isSupported: false, isInApp: false, message: 'Oppo Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome แทน' };
  }
  if (ua.includes('huaweibrowser')) {
    return { name: 'Huawei Browser', isSupported: false, isInApp: false, message: 'Huawei Browser อาจไม่รองรับ Push Notification กรุณาใช้ Chrome แทน' };
  }
  
  // ตรวจสอบ Browser ที่รองรับ
  if (ua.includes('edg/') || ua.includes('edge/')) {
    return { name: 'Edge', isSupported: true, isInApp: false };
  }
  if (ua.includes('opr/') || ua.includes('opera')) {
    return { name: 'Opera', isSupported: true, isInApp: false };
  }
  if (ua.includes('samsungbrowser')) {
    return { name: 'Samsung Internet', isSupported: true, isInApp: false };
  }
  if (ua.includes('brave')) {
    return { name: 'Brave', isSupported: true, isInApp: false };
  }
  if (ua.includes('firefox') || ua.includes('fxios')) {
    return { name: 'Firefox', isSupported: true, isInApp: false };
  }
  if (ua.includes('crios')) {
    return { name: 'Chrome (iOS)', isSupported: false, isInApp: false, message: 'Chrome บน iOS ไม่รองรับ Push กรุณาใช้ Safari และ Add to Home Screen' };
  }
  if (ua.includes('chrome') && !ua.includes('edg')) {
    return { name: 'Chrome', isSupported: true, isInApp: false };
  }
  if (ua.includes('safari') && !ua.includes('chrome')) {
    const isIOS = /iphone|ipad|ipod/.test(ua);
    if (isIOS) {
      return { name: 'Safari (iOS)', isSupported: true, isInApp: false, message: 'ต้อง Add to Home Screen ก่อนถึงจะรับแจ้งเตือนได้' };
    }
    return { name: 'Safari', isSupported: true, isInApp: false };
  }
  
  // ไม่รู้จัก - ลองตรวจสอบ API
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  const hasNotification = 'Notification' in window;
  
  if (hasServiceWorker && hasPushManager && hasNotification) {
    return { name: 'Unknown', isSupported: true, isInApp: false };
  }
  
  return { name: 'Unknown', isSupported: false, isInApp: false, message: 'เบราว์เซอร์นี้ไม่รองรับ Push Notification' };
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function checkPushSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
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
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({ name: 'unknown', isSupported: false, isInApp: false });

  const needsInstall = isIOS && !isStandalone && browserInfo.name.includes('Safari');

  useEffect(() => {
    const init = async () => {
      // ตรวจสอบ browser
      const browser = detectBrowser();
      setBrowserInfo(browser);
      console.log('Browser detected:', browser);
      
      // ตรวจสอบ platform
      const ios = checkIsIOS();
      const standalone = checkIsStandalone();
      setIsIOS(ios);
      setIsStandalone(standalone);
      
      // In-app browser ไม่รองรับ
      if (browser.isInApp || !browser.isSupported) {
        console.log('Browser not supported:', browser.name);
        setIsSupported(false);
        return;
      }
      
      // iOS ต้อง Add to Home Screen
      if (ios && !standalone) {
        console.log('iOS requires Add to Home Screen');
        setIsSupported(false);
        return;
      }
      
      // ตรวจสอบ Push API
      if (!checkPushSupport()) {
        console.log('Push API not supported');
        setIsSupported(false);
        return;
      }
      
      setIsSupported(true);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        setRegistration(reg);
        await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Service worker error:', err);
        setError('Failed to register service worker');
        setIsSupported(false);
      }
    };
    
    init();
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration) {
      setError('Service worker not registered');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Notification permission denied');
        setIsLoading(false);
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('Failed to get subscription keys');
      }
      
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
      if (!response.ok) throw new Error('Failed to save subscription');
      setIsSubscribed(true);
    } catch (err) {
      console.error('Subscribe error:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  }, [registration, adminToken]);

  const unsubscribe = useCallback(async () => {
    if (!registration) {
      setError('Service worker not registered');
      return;
    }
    setIsLoading(true);
    setError(null);
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
      console.error('Unsubscribe error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
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
