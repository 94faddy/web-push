// Service Worker for Web Push Notifications

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installed');
  event.waitUntil(self.skipWaiting());
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Push event - รับ notification
self.addEventListener('push', (event) => {
  console.log('📬 Push received:', event);

  if (!event.data) {
    console.log('No push data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image, // รูปภาพใหญ่ (รองรับ Chrome/Edge)
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
      timestamp: data.timestamp || Date.now(),
      data: {
        url: data.url || '/',
        ...data.data
      },
      actions: data.actions || [
        { action: 'open', title: '🔗 เปิดดู' },
        { action: 'close', title: '❌ ปิด' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options)
    );
  } catch (error) {
    console.error('Error processing push:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const url = event.notification.data?.url || '/';

  if (action === 'close') {
    return;
  }

  // Open URL when clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('❎ Notification closed:', event);
});
