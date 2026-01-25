'use client';

import { useState, useEffect, useCallback } from 'react';
import { VAPID_PUBLIC_KEY } from '@/lib/config';

interface BrowserInfo {
  name: string;
  isSupported: boolean;
  isInApp: boolean;
  message?: string;
  isBrave?: boolean;
  isEdge?: boolean;
  isIOSBrowser?: boolean; // iOS browser ที่รองรับ Add to Home Screen
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

// Helper: Promise with timeout
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

// ตรวจสอบว่าเป็น Brave browser หรือไม่
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
  
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('brave')) {
    return true;
  }
  
  return false;
}

// ตรวจสอบว่าเป็น iOS หรือไม่
function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

// ตรวจสอบ Browser อย่างละเอียด
async function detectBrowser(): Promise<BrowserInfo> {
  if (typeof window === 'undefined') {
    return { name: 'unknown', isSupported: false, isInApp: false };
  }
  
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = checkIsIOS();
  
  // ตรวจสอบ In-app Browser (ไม่รองรับ Push)
  if (ua.includes('line')) {
    return { name: 'LINE', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome, Brave หรือ Safari แทน กดที่ ⋮ แล้วเลือก "เปิดใน Browser"' };
  }
  if (ua.includes('fbav') || ua.includes('fban') || ua.includes('fb_iab')) {
    return { name: 'Facebook', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome, Brave หรือ Safari แทน กดที่ ⋮ แล้วเลือก "เปิดใน Browser"' };
  }
  if (ua.includes('instagram')) {
    return { name: 'Instagram', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome, Brave หรือ Safari แทน กดที่ ⋮ แล้วเลือก "เปิดใน Browser"' };
  }
  if (ua.includes('twitter') || ua.includes('twitterandroid')) {
    return { name: 'Twitter/X', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome, Brave หรือ Safari แทน' };
  }
  if (ua.includes('tiktok')) {
    return { name: 'TikTok', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome, Brave หรือ Safari แทน' };
  }
  if (ua.includes('snapchat')) {
    return { name: 'Snapchat', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome, Brave หรือ Safari แทน' };
  }
  if (ua.includes('wv') && ua.includes('android')) {
    return { name: 'WebView', isSupported: false, isInApp: true, message: 'กรุณาเปิดใน Chrome หรือ Brave แทน' };
  }
  
  // ตรวจสอบ Browser ที่ไม่รองรับ Push (Android)
  if (!isIOS) {
    if (ua.includes('ucbrowser') || ua.includes('ucweb')) {
      return { name: 'UC Browser', isSupported: false, isInApp: false, message: 'UC Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome, Brave หรือ Firefox แทน' };
    }
    if (ua.includes('miuibrowser')) {
      return { name: 'Mi Browser', isSupported: false, isInApp: false, message: 'Mi Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome หรือ Brave แทน' };
    }
    if (ua.includes('vivobrowser')) {
      return { name: 'Vivo Browser', isSupported: false, isInApp: false, message: 'Vivo Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome หรือ Brave แทน' };
    }
    if (ua.includes('oppobrowser')) {
      return { name: 'Oppo Browser', isSupported: false, isInApp: false, message: 'Oppo Browser ไม่รองรับ Push Notification กรุณาใช้ Chrome หรือ Brave แทน' };
    }
    if (ua.includes('huaweibrowser')) {
      return { name: 'Huawei Browser', isSupported: false, isInApp: false, message: 'Huawei Browser อาจไม่รองรับ Push Notification กรุณาใช้ Chrome หรือ Brave แทน' };
    }
  }
  
  // *** iOS Browser - ทุก browser รองรับ Add to Home Screen ***
  if (isIOS) {
    // Chrome บน iOS
    if (ua.includes('crios')) {
      return { 
        name: 'Chrome (iOS)', 
        isSupported: true, 
        isInApp: false, 
        isIOSBrowser: true,
        message: 'กด Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    // Firefox บน iOS
    if (ua.includes('fxios')) {
      return { 
        name: 'Firefox (iOS)', 
        isSupported: true, 
        isInApp: false, 
        isIOSBrowser: true,
        message: 'กด Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    // Edge บน iOS
    if (ua.includes('edgios')) {
      return { 
        name: 'Edge (iOS)', 
        isSupported: true, 
        isInApp: false, 
        isIOSBrowser: true,
        message: 'กด Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    // Opera บน iOS
    if (ua.includes('opios') || ua.includes('opt/')) {
      return { 
        name: 'Opera (iOS)', 
        isSupported: true, 
        isInApp: false, 
        isIOSBrowser: true,
        message: 'กด Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    // Safari บน iOS
    if (ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios')) {
      return { 
        name: 'Safari (iOS)', 
        isSupported: true, 
        isInApp: false, 
        isIOSBrowser: true,
        message: 'กด Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
      };
    }
    // iOS browser อื่นๆ
    return { 
      name: 'Browser (iOS)', 
      isSupported: true, 
      isInApp: false, 
      isIOSBrowser: true,
      message: 'กด Share แล้วเลือก "เพิ่มไปยังหน้าจอโฮม"' 
    };
  }
  
  // *** Desktop/Android Browser ***
  
  // ตรวจสอบ Brave ก่อน Chrome
  const isBrave = await checkIsBrave();
  if (isBrave) {
    return { 
      name: 'Brave', 
      isSupported: true, 
      isInApp: false, 
      isBrave: true,
      message: 'Brave รองรับ Push Notification (ต้องเปิดใช้งานใน Settings > Privacy > Use Google Services for Push Messaging)' 
    };
  }
  
  // Edge
  if (ua.includes('edg/') || ua.includes('edge/')) {
    return { name: 'Edge', isSupported: true, isInApp: false, isEdge: true };
  }
  
  // Opera
  if (ua.includes('opr/') || ua.includes('opera')) {
    return { name: 'Opera', isSupported: true, isInApp: false };
  }
  
  // Samsung Internet
  if (ua.includes('samsungbrowser')) {
    return { name: 'Samsung Internet', isSupported: true, isInApp: false };
  }
  
  // Firefox
  if (ua.includes('firefox')) {
    return { name: 'Firefox', isSupported: true, isInApp: false };
  }
  
  // Chrome
  if (ua.includes('chrome') && !ua.includes('edg')) {
    return { name: 'Chrome', isSupported: true, isInApp: false };
  }
  
  // Safari (macOS)
  if (ua.includes('safari') && !ua.includes('chrome')) {
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

// ตรวจสอบว่า Brave เปิดใช้งาน Google Push Services หรือไม่
async function checkBravePushEnabled(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub) return true;
    const permState = await reg.pushManager.permissionState({ userVisibleOnly: true });
    return permState !== 'denied';
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
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({ name: 'unknown', isSupported: false, isInApp: false });

  // iOS ต้อง Add to Home Screen ก่อน (ไม่ว่าจะเป็น Safari, Chrome, Firefox ฯลฯ)
  const needsInstall = isIOS && !isStandalone && browserInfo.isIOSBrowser === true;

  useEffect(() => {
    const init = async () => {
      // ตรวจสอบ browser
      const browser = await detectBrowser();
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
      
      // iOS ต้อง Add to Home Screen (ใช้ได้กับทุก browser)
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
        const reg = await withTimeout(
          navigator.serviceWorker.register('/sw.js', { scope: '/' }),
          10000,
          'Service worker registration timeout'
        );
        setRegistration(reg);
        
        await withTimeout(
          navigator.serviceWorker.ready,
          10000,
          'Service worker ready timeout'
        );
        
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
      console.log('Starting subscription process...');
      
      // Step 1: รอ Service Worker ready
      await withTimeout(
        navigator.serviceWorker.ready,
        10000,
        'Service worker ไม่พร้อมใช้งาน กรุณารีเฟรชหน้าแล้วลองใหม่'
      );
      
      // Step 2: ตรวจสอบ Permission
      const currentPermission = Notification.permission;
      
      if (currentPermission === 'denied') {
        if (browserInfo.isEdge) {
          setError('Edge: การแจ้งเตือนถูกบล็อก กรุณาคลิกที่ไอคอน 🔒 ในแถบ URL แล้วเปิดใช้งาน Notifications');
        } else {
          setError('การแจ้งเตือนถูกบล็อก กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์');
        }
        setPermission('denied');
        setIsLoading(false);
        return;
      }
      
      // Step 3: ขอ Permission
      let perm: NotificationPermission;
      
      if (currentPermission === 'granted') {
        perm = 'granted';
      } else {
        const permissionPromise = Notification.requestPermission();
        
        let resolved = false;
        const pollInterval = setInterval(() => {
          const newPerm = Notification.permission;
          if (newPerm !== 'default') {
            resolved = true;
            clearInterval(pollInterval);
          }
        }, 500);
        
        const timeoutPromise = new Promise<NotificationPermission>((resolve) => {
          setTimeout(() => {
            if (!resolved) {
              clearInterval(pollInterval);
              resolve(Notification.permission);
            }
          }, 60000);
        });
        
        try {
          perm = await Promise.race([permissionPromise, timeoutPromise]);
        } catch {
          perm = Notification.permission;
        }
        
        clearInterval(pollInterval);
      }
      
      setPermission(perm);
      
      if (perm === 'default') {
        if (browserInfo.isEdge) {
          setError('Edge: Popup ขอสิทธิ์อาจไม่แสดง กรุณาคลิกที่ไอคอน 🔒 ในแถบ URL → Site permissions → Notifications → Allow');
        } else {
          setError('กรุณากดอนุญาต (Allow) เมื่อมี popup ปรากฏ');
        }
        setIsLoading(false);
        return;
      }
      
      if (perm !== 'granted') {
        if (browserInfo.isEdge) {
          setError('Edge: กรุณาอนุญาตการแจ้งเตือน คลิกที่ไอคอน 🔒 ในแถบ URL → Notifications → Allow');
        } else {
          setError('กรุณากดอนุญาต (Allow) เพื่อรับการแจ้งเตือน');
        }
        setIsLoading(false);
        return;
      }
      
      // Step 4: Brave - ตรวจสอบ Google Push Services
      if (browserInfo.isBrave) {
        const braveEnabled = await checkBravePushEnabled();
        if (!braveEnabled) {
          setError('Brave: กรุณาเปิด "Use Google Services for Push Messaging" ใน Settings > Privacy');
          setIsLoading(false);
          return;
        }
      }
      
      // Step 5: สร้าง Push Subscription
      let subscription: PushSubscription;
      
      try {
        subscription = await withTimeout(
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          }),
          30000,
          'การสมัครรับการแจ้งเตือนหมดเวลา กรุณารีเฟรชหน้าแล้วลองใหม่'
        );
      } catch (pushError: unknown) {
        console.error('Push subscription error:', pushError);
        
        const errorMessage = pushError instanceof Error ? pushError.message : String(pushError);
        
        if (browserInfo.isBrave && (errorMessage.includes('push service') || errorMessage.includes('Registration failed'))) {
          setError('Brave: กรุณาเปิด "Use Google Services for Push Messaging" ใน brave://settings/privacy');
          setIsLoading(false);
          return;
        }
        
        if (browserInfo.isEdge) {
          setError('Edge: ไม่สามารถสมัครรับการแจ้งเตือนได้ กรุณาตรวจสอบการตั้งค่า Notifications');
          setIsLoading(false);
          return;
        }
        
        throw pushError;
      }
      
      // Step 6: ดึง Keys
      const p256dhKey = subscription.getKey('p256dh');
      const authKey = subscription.getKey('auth');
      
      if (!p256dhKey || !authKey) {
        throw new Error('ไม่สามารถสร้าง keys สำหรับการแจ้งเตือนได้');
      }
      
      // Step 7: ส่งข้อมูลไป Server
      const response = await withTimeout(
        fetch('/api/subscribe', {
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
        }),
        15000,
        'การบันทึกข้อมูลหมดเวลา กรุณาลองใหม่'
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`บันทึกข้อมูลไม่สำเร็จ: ${errorText}`);
      }
      
      setIsSubscribed(true);
      
    } catch (err) {
      console.error('Subscribe error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสมัคร';
      
      if (browserInfo.isBrave && (errorMessage.includes('push service') || errorMessage.includes('Registration failed'))) {
        setError('Brave: ไปที่ brave://settings/privacy แล้วเปิด "Use Google Services for Push Messaging"');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [registration, adminToken, browserInfo.isBrave, browserInfo.isEdge]);

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