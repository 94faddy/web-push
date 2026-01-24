import webpush from 'web-push';

// Set VAPID details
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

// แปลง base64 เป็น base64url
function base64ToBase64Url(base64: string): string {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const pushPayload = JSON.stringify({
      ...payload,
      timestamp: payload.timestamp || Date.now(),
    });

    // แปลง keys เป็น base64url format
    const convertedSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: base64ToBase64Url(subscription.keys.p256dh),
        auth: base64ToBase64Url(subscription.keys.auth)
      }
    };

    await webpush.sendNotification(convertedSubscription, pushPayload, {
      TTL: 86400,
      urgency: 'normal',
    });

    return { success: true };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    console.error('Push error:', err);
    
    if (err.statusCode === 404 || err.statusCode === 410) {
      return { success: false, error: 'subscription_expired' };
    }
    
    return { success: false, error: err.message || 'Unknown error' };
  }
}

export default webpush;