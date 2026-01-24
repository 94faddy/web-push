// VAPID Public Key - ดึงจาก .env
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// ตรวจสอบว่ามีค่าหรือไม่
if (!VAPID_PUBLIC_KEY && typeof window !== 'undefined') {
  console.warn('VAPID_PUBLIC_KEY is not set in .env');
}