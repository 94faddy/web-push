'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import Swal from 'sweetalert2';

interface PageSettings {
  button_hue: number;
  button_saturation: number;
  button_lightness: number;
  bg_type: 'solid' | 'gradient' | 'image';
  bg_hue: number;
  bg_saturation: number;
  bg_lightness: number;
  bg_gradient_hue2: number;
  bg_gradient_saturation2: number;
  bg_gradient_lightness2: number;
  bg_gradient_angle: number;
  bg_image_url: string;
  bg_image_overlay: boolean;
  bg_image_overlay_opacity: number;
  logo_url: string;
  logo_width: number;
  page_title: string;
  page_subtitle: string;
  subscribe_icon: string;
  subscribe_icon_bg: string;
  subscribe_icon_color: string;
  subscribe_title: string;
  subscribe_subtitle: string;
  subscribe_button_text: string;
  subscribe_loading_text: string;
  subscribe_button_hue: number;
  subscribe_button_saturation: number;
  subscribe_button_lightness: number;
  success_icon: string;
  success_icon_bg: string;
  success_icon_color: string;
  success_title: string;
  success_title_existing: string;
  success_subtitle: string;
  success_box_icon: string;
  success_box_icon_color: string;
  success_box_title: string;
  success_box_subtitle: string;
  success_button_hue: number;
  success_button_saturation: number;
  success_button_lightness: number;
  blocked_icon: string;
  blocked_icon_bg: string;
  blocked_icon_color: string;
  blocked_title: string;
  blocked_subtitle: string;
  blocked_button_text: string;
  blocked_tip_icon: string;
  blocked_tip_icon_color: string;
  blocked_tip_text: string;
  blocked_button_hue: number;
  blocked_button_saturation: number;
  blocked_button_lightness: number;
  ios_safari_icon: string;
  ios_safari_icon_bg: string;
  ios_safari_icon_color: string;
  ios_safari_title: string;
  ios_safari_subtitle: string;
  ios_safari_button_text: string;
  ios_safari_button_hue: number;
  ios_safari_button_saturation: number;
  ios_safari_button_lightness: number;
  ios_chrome_icon: string;
  ios_chrome_icon_bg: string;
  ios_chrome_icon_color: string;
  ios_chrome_title: string;
  ios_chrome_subtitle: string;
  ios_chrome_button_text: string;
  ios_chrome_button_hue: number;
  ios_chrome_button_saturation: number;
  ios_chrome_button_lightness: number;
  ios_unsupported_icon: string;
  ios_unsupported_icon_bg: string;
  ios_unsupported_icon_color: string;
  ios_unsupported_title: string;
  ios_unsupported_subtitle: string;
  ios_unsupported_button_text: string;
  ios_unsupported_copy_success: string;
  ios_unsupported_copy_hint: string;
  ios_unsupported_button_hue: number;
  ios_unsupported_button_saturation: number;
  ios_unsupported_button_lightness: number;
  android_unsupported_icon: string;
  android_unsupported_icon_bg: string;
  android_unsupported_icon_color: string;
  android_unsupported_title: string;
  android_unsupported_subtitle: string;
  android_unsupported_button_text: string;
  android_unsupported_loading_text: string;
  android_unsupported_copy_success: string;
  android_unsupported_copy_hint: string;
  android_unsupported_button_hue: number;
  android_unsupported_button_saturation: number;
  android_unsupported_button_lightness: number;
  footer_title: string;
  footer_item1_icon: string;
  footer_item1_icon_color: string;
  footer_item1_text: string;
  footer_item2_icon: string;
  footer_item2_icon_color: string;
  footer_item2_text: string;
  footer_item3_icon: string;
  footer_item3_icon_color: string;
  footer_item3_text: string;
}

// Default Settings - ใช้ Iconify icons ทั้งหมด (ไม่มี emoji)
const DEFAULT: PageSettings = {
  button_hue: 142, button_saturation: 71, button_lightness: 45,
  bg_type: 'gradient', bg_hue: 142, bg_saturation: 71, bg_lightness: 45,
  bg_gradient_hue2: 142, bg_gradient_saturation2: 76, bg_gradient_lightness2: 36, bg_gradient_angle: 135,
  bg_image_url: '', bg_image_overlay: true, bg_image_overlay_opacity: 40,
  logo_url: '', logo_width: 120,
  page_title: 'Web Push Notifications', page_subtitle: 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา',
  subscribe_icon: 'mdi:bell', subscribe_icon_bg: 'linear-gradient(135deg, hsl(45, 85%, 88%) 0%, hsl(45, 75%, 78%) 100%)', subscribe_icon_color: '#f59e0b',
  subscribe_title: 'รับการแจ้งเตือน', subscribe_subtitle: 'สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร',
  subscribe_button_text: 'สมัครรับการแจ้งเตือน', subscribe_loading_text: 'กำลังดำเนินการ...',
  subscribe_button_hue: 142, subscribe_button_saturation: 71, subscribe_button_lightness: 45,
  success_icon: 'mdi:check-circle', success_icon_bg: 'linear-gradient(135deg, hsl(142, 85%, 88%) 0%, hsl(142, 75%, 78%) 100%)', success_icon_color: '#16a34a',
  success_title: 'สมัครสำเร็จ!', success_title_existing: 'คุณกำลังรับการแจ้งเตือน',
  success_subtitle: 'คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา',
  success_box_icon: 'mdi:bell-ring', success_box_icon_color: '#16a34a', success_box_title: 'ระบบพร้อมแจ้งเตือน',
  success_box_subtitle: 'เมื่อมีข่าวสารใหม่ คุณจะได้รับการแจ้งเตือนทันที',
  success_button_hue: 142, success_button_saturation: 71, success_button_lightness: 45,
  blocked_icon: 'mdi:bell-off', blocked_icon_bg: 'linear-gradient(135deg, hsl(0, 85%, 88%) 0%, hsl(0, 75%, 78%) 100%)', blocked_icon_color: '#dc2626',
  blocked_title: 'การแจ้งเตือนถูกบล็อก', blocked_subtitle: 'กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์',
  blocked_button_text: 'ดูวิธีเปิดการแจ้งเตือน', blocked_tip_icon: 'mdi:lightbulb', blocked_tip_icon_color: '#ca8a04',
  blocked_tip_text: 'หลังจากเปิดการแจ้งเตือนแล้ว ให้รีเฟรชหน้านี้',
  blocked_button_hue: 142, blocked_button_saturation: 71, blocked_button_lightness: 45,
  ios_safari_icon: 'mdi:cellphone', ios_safari_icon_bg: 'linear-gradient(135deg, hsl(210, 85%, 88%) 0%, hsl(210, 75%, 78%) 100%)', ios_safari_icon_color: '#3b82f6',
  ios_safari_title: 'เพิ่มลงหน้าจอหลัก', ios_safari_subtitle: 'กรุณาเพิ่มเว็บไซต์นี้ลงหน้าจอหลัก', ios_safari_button_text: 'ดูวิธีทำ',
  ios_safari_button_hue: 142, ios_safari_button_saturation: 71, ios_safari_button_lightness: 45,
  ios_chrome_icon: 'mdi:cellphone', ios_chrome_icon_bg: 'linear-gradient(135deg, hsl(210, 85%, 88%) 0%, hsl(210, 75%, 78%) 100%)', ios_chrome_icon_color: '#3b82f6',
  ios_chrome_title: 'เพิ่มลงหน้าจอหลัก', ios_chrome_subtitle: 'กรุณาเพิ่มเว็บไซต์นี้ลงหน้าจอหลัก', ios_chrome_button_text: 'ดูวิธีทำ',
  ios_chrome_button_hue: 142, ios_chrome_button_saturation: 71, ios_chrome_button_lightness: 45,
  ios_unsupported_icon: 'mdi:apple-safari', ios_unsupported_icon_bg: 'linear-gradient(135deg, hsl(210, 85%, 88%) 0%, hsl(210, 75%, 78%) 100%)', ios_unsupported_icon_color: '#3b82f6',
  ios_unsupported_title: 'เปิดใน Safari', ios_unsupported_subtitle: 'กรุณาเปิดลิงก์นี้ใน Safari', ios_unsupported_button_text: 'เปิดใน Safari',
  ios_unsupported_copy_success: 'คัดลอกลิงก์แล้ว!', ios_unsupported_copy_hint: 'วางลิงก์ใน Safari',
  ios_unsupported_button_hue: 142, ios_unsupported_button_saturation: 71, ios_unsupported_button_lightness: 45,
  android_unsupported_icon: 'mdi:google-chrome', android_unsupported_icon_bg: 'linear-gradient(135deg, hsl(45, 85%, 88%) 0%, hsl(45, 75%, 78%) 100%)', android_unsupported_icon_color: '#f59e0b',
  android_unsupported_title: 'เปิดใน Chrome', android_unsupported_subtitle: 'กรุณาเปิดลิงก์นี้ใน Chrome', android_unsupported_button_text: 'เปิดใน Chrome',
  android_unsupported_loading_text: 'กำลังเปิด Chrome...', android_unsupported_copy_success: 'คัดลอกลิงก์แล้ว!', android_unsupported_copy_hint: 'วางลิงก์ใน Chrome',
  android_unsupported_button_hue: 142, android_unsupported_button_saturation: 71, android_unsupported_button_lightness: 45,
  footer_title: 'สิ่งที่คุณจะได้รับ',
  footer_item1_icon: 'mdi:newspaper', footer_item1_icon_color: '#3b82f6', footer_item1_text: 'ข่าวสารล่าสุด',
  footer_item2_icon: 'mdi:gift', footer_item2_icon_color: '#22c55e', footer_item2_text: 'โปรโมชั่น',
  footer_item3_icon: 'mdi:lightning-bolt', footer_item3_icon_color: '#f59e0b', footer_item3_text: 'แจ้งเตือนทันที'
};

const tabs = [
  { id: 'design', label: 'Design' },
  { id: 'subscribe', label: 'Register' },
  { id: 'success', label: 'Success' },
  { id: 'blocked', label: 'Block Notify' },
  { id: 'ios_safari', label: 'iOS Safari' },
  { id: 'ios_chrome', label: 'iOS Chrome' },
  { id: 'ios_unsupported', label: 'iOS Unsupport' },
  { id: 'android_unsupported', label: 'Android Unsupport' },
  { id: 'footer', label: 'Footer' }
];

// Icon Categories - ใช้ icons ที่มีจริงใน MDI เท่านั้น
const ICONS = {
  'แจ้งเตือน': ['mdi:bell', 'mdi:bell-ring', 'mdi:bell-outline', 'mdi:bell-alert', 'mdi:bell-check', 'mdi:bell-off', 'mdi:bell-plus', 'mdi:bell-minus', 'mdi:bell-cancel', 'mdi:bell-badge', 'mdi:bell-circle', 'mdi:bell-cog', 'mdi:alarm', 'mdi:alarm-check', 'mdi:alarm-plus', 'mdi:alarm-bell', 'mdi:alarm-light', 'mdi:bullhorn', 'mdi:bullhorn-outline', 'mdi:bullhorn-variant', 'mdi:air-horn', 'mdi:volume-high', 'mdi:volume-medium', 'mdi:volume-low'],
  'สำเร็จ': ['mdi:check', 'mdi:check-circle', 'mdi:check-bold', 'mdi:check-decagram', 'mdi:checkbox-marked-circle', 'mdi:check-all', 'mdi:check-circle-outline', 'mdi:check-outline', 'mdi:checkbox-marked', 'mdi:thumb-up', 'mdi:thumb-up-outline', 'mdi:emoticon-happy', 'mdi:emoticon-excited', 'mdi:emoticon-cool', 'mdi:party-popper', 'mdi:fireworks', 'mdi:trophy', 'mdi:trophy-award', 'mdi:trophy-outline', 'mdi:medal', 'mdi:crown', 'mdi:star-circle', 'mdi:seal', 'mdi:ribbon'],
  'ข้อผิดพลาด': ['mdi:close', 'mdi:close-circle', 'mdi:close-circle-outline', 'mdi:close-box', 'mdi:close-octagon', 'mdi:alert', 'mdi:alert-circle', 'mdi:alert-circle-outline', 'mdi:alert-octagon', 'mdi:alert-rhombus', 'mdi:cancel', 'mdi:block-helper', 'mdi:do-not-disturb', 'mdi:minus-circle', 'mdi:minus-circle-outline', 'mdi:exclamation', 'mdi:exclamation-thick', 'mdi:information', 'mdi:information-outline', 'mdi:help', 'mdi:help-circle', 'mdi:help-circle-outline', 'mdi:alert-outline', 'mdi:alert-box'],
  'มือถือ': ['mdi:cellphone', 'mdi:cellphone-check', 'mdi:cellphone-cog', 'mdi:cellphone-link', 'mdi:cellphone-message', 'mdi:cellphone-wireless', 'mdi:tablet', 'mdi:tablet-android', 'mdi:tablet-cellphone', 'mdi:monitor', 'mdi:monitor-cellphone', 'mdi:laptop', 'mdi:desktop-mac', 'mdi:desktop-tower', 'mdi:devices', 'mdi:cast', 'mdi:cast-connected', 'mdi:television', 'mdi:television-classic', 'mdi:projector', 'mdi:remote', 'mdi:headphones', 'mdi:speaker', 'mdi:watch'],
  'เบราว์เซอร์': ['mdi:web', 'mdi:web-box', 'mdi:web-check', 'mdi:web-clock', 'mdi:web-plus', 'mdi:web-minus', 'mdi:google-chrome', 'mdi:apple-safari', 'mdi:firefox', 'mdi:microsoft-edge', 'mdi:opera', 'mdi:application', 'mdi:application-outline', 'mdi:application-cog', 'mdi:window-maximize', 'mdi:window-minimize', 'mdi:window-restore', 'mdi:tab', 'mdi:tab-plus', 'mdi:earth', 'mdi:earth-box', 'mdi:compass', 'mdi:navigation', 'mdi:link'],
  'โซเชียล': ['mdi:facebook', 'mdi:facebook-messenger', 'mdi:instagram', 'mdi:twitter', 'mdi:youtube', 'mdi:telegram', 'mdi:whatsapp', 'mdi:discord', 'mdi:slack', 'mdi:snapchat', 'mdi:pinterest', 'mdi:linkedin', 'mdi:reddit', 'mdi:github', 'mdi:gitlab', 'mdi:twitch', 'mdi:spotify', 'mdi:steam', 'mdi:google', 'mdi:apple', 'mdi:microsoft', 'mdi:amazon', 'mdi:skype', 'mdi:wechat'],
  'คน/ผู้ใช้': ['mdi:account', 'mdi:account-outline', 'mdi:account-circle', 'mdi:account-box', 'mdi:account-check', 'mdi:account-plus', 'mdi:account-minus', 'mdi:account-remove', 'mdi:account-group', 'mdi:account-multiple', 'mdi:account-star', 'mdi:account-heart', 'mdi:account-key', 'mdi:account-lock', 'mdi:account-cog', 'mdi:face-man', 'mdi:face-woman', 'mdi:face-man-outline', 'mdi:face-woman-outline', 'mdi:human', 'mdi:human-male', 'mdi:human-female', 'mdi:human-greeting', 'mdi:hand-wave'],
  'ของขวัญ': ['mdi:gift', 'mdi:gift-outline', 'mdi:gift-open', 'mdi:gift-off', 'mdi:gift-open-outline', 'mdi:sale', 'mdi:percent', 'mdi:percent-outline', 'mdi:percent-box', 'mdi:tag', 'mdi:tag-outline', 'mdi:tag-multiple', 'mdi:tag-heart', 'mdi:tag-text', 'mdi:ticket', 'mdi:ticket-outline', 'mdi:ticket-percent', 'mdi:ticket-confirmation', 'mdi:basket', 'mdi:cart', 'mdi:cart-outline', 'mdi:shopping', 'mdi:store', 'mdi:storefront'],
  'ข่าวสาร': ['mdi:newspaper', 'mdi:newspaper-variant', 'mdi:newspaper-variant-outline', 'mdi:file-document', 'mdi:file-document-outline', 'mdi:file-document-multiple', 'mdi:text-box', 'mdi:text-box-outline', 'mdi:text-box-check', 'mdi:text-box-plus', 'mdi:note', 'mdi:note-outline', 'mdi:note-text', 'mdi:note-multiple', 'mdi:book', 'mdi:book-open', 'mdi:book-open-page-variant', 'mdi:bookshelf', 'mdi:clipboard', 'mdi:clipboard-text', 'mdi:clipboard-check', 'mdi:clipboard-list', 'mdi:rss', 'mdi:post'],
  'ข้อความ': ['mdi:message', 'mdi:message-outline', 'mdi:message-text', 'mdi:message-text-outline', 'mdi:message-reply', 'mdi:message-processing', 'mdi:message-alert', 'mdi:message-plus', 'mdi:chat', 'mdi:chat-outline', 'mdi:chat-processing', 'mdi:chat-plus', 'mdi:chat-alert', 'mdi:comment', 'mdi:comment-outline', 'mdi:comment-text', 'mdi:comment-multiple', 'mdi:forum', 'mdi:forum-outline', 'mdi:email', 'mdi:email-outline', 'mdi:email-open', 'mdi:inbox', 'mdi:send'],
  'พลังงาน': ['mdi:lightning-bolt', 'mdi:lightning-bolt-outline', 'mdi:lightning-bolt-circle', 'mdi:flash', 'mdi:flash-outline', 'mdi:flash-circle', 'mdi:flash-auto', 'mdi:flash-alert', 'mdi:fire', 'mdi:fire-circle', 'mdi:fire-alert', 'mdi:flame', 'mdi:rocket', 'mdi:rocket-launch', 'mdi:rocket-outline', 'mdi:speedometer', 'mdi:speedometer-medium', 'mdi:speedometer-slow', 'mdi:gauge', 'mdi:timer', 'mdi:timer-outline', 'mdi:timer-sand', 'mdi:clock-fast', 'mdi:run-fast'],
  'หัวใจ': ['mdi:heart', 'mdi:heart-outline', 'mdi:heart-circle', 'mdi:heart-box', 'mdi:heart-multiple', 'mdi:heart-plus', 'mdi:heart-minus', 'mdi:heart-off', 'mdi:heart-broken', 'mdi:heart-pulse', 'mdi:cards-heart', 'mdi:hand-heart', 'mdi:emoticon', 'mdi:emoticon-outline', 'mdi:emoticon-happy', 'mdi:emoticon-happy-outline', 'mdi:emoticon-excited', 'mdi:emoticon-cool', 'mdi:emoticon-kiss', 'mdi:emoticon-wink', 'mdi:star', 'mdi:star-outline', 'mdi:star-circle', 'mdi:star-box'],
  'ตั้งค่า': ['mdi:cog', 'mdi:cog-outline', 'mdi:cogs', 'mdi:cog-box', 'mdi:cog-transfer', 'mdi:wrench', 'mdi:wrench-outline', 'mdi:tools', 'mdi:hammer', 'mdi:hammer-wrench', 'mdi:screwdriver', 'mdi:toolbox', 'mdi:toolbox-outline', 'mdi:tune', 'mdi:tune-vertical', 'mdi:tune-variant', 'mdi:equalizer', 'mdi:toggle-switch', 'mdi:toggle-switch-off', 'mdi:power', 'mdi:power-settings', 'mdi:key', 'mdi:key-variant', 'mdi:lock'],
  'บ้าน': ['mdi:home', 'mdi:home-outline', 'mdi:home-circle', 'mdi:home-variant', 'mdi:home-account', 'mdi:home-city', 'mdi:home-modern', 'mdi:office-building', 'mdi:domain', 'mdi:store', 'mdi:warehouse', 'mdi:factory', 'mdi:hospital-building', 'mdi:school', 'mdi:library', 'mdi:bank', 'mdi:castle', 'mdi:map-marker', 'mdi:map-marker-check', 'mdi:map-marker-plus', 'mdi:pin', 'mdi:shield', 'mdi:shield-check', 'mdi:security']
};
const iconCategories = Object.entries(ICONS).map(([name, icons]) => ({ name, icons }));

const presetColors = ['#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

const SvgIcons = {
  save: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  reset: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  upload: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  trash: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  spinner: <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>,
  external: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  close: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

// TextInput - memo with internal fallback
const TextInput = memo(function TextInput({ label, value, onChange, multiline, placeholder }: { label: string; value: string | undefined | null; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; }) {
  const safeValue = value ?? '';
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {multiline ? (
        <textarea value={safeValue} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
      ) : (
        <input type="text" value={safeValue} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
      )}
    </div>
  );
});

// IconDisplay - รองรับทั้ง emoji และ Iconify icons พร้อม fallback
function IconDisplay({ icon, color, size = 28 }: { icon?: string | null; color?: string | null; size?: number }) {
  const safeIcon = icon || 'mdi:star';
  const safeColor = color || '#3b82f6';
  
  // ถ้าเป็น emoji (ไม่มี :)
  if (!safeIcon.includes(':')) return <span style={{ fontSize: size }}>{safeIcon}</span>;
  
  // ถ้าเป็น Iconify icon
  return <img src={`https://api.iconify.design/${safeIcon}.svg?color=${encodeURIComponent(safeColor)}`} alt="" style={{ width: size, height: size, display: 'block' }} />;
}

// IconPicker with internal fallback
function IconPicker({ value, color, onChange, onColorChange, label }: { value: string | undefined | null; color: string | undefined | null; onChange: (v: string) => void; onColorChange: (c: string) => void; label: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Safe values with fallback
  const safeValue = value || 'mdi:bell';
  const safeColor = color || '#000000';

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(search)}&limit=100&prefixes=mdi`);
        const data = await res.json();
        setResults(data.icons || []);
      } catch { setResults([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const isEmoji = !safeValue.includes(':');
  const encodedColor = encodeURIComponent(safeColor);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 items-center">
        <button type="button" onClick={() => setIsOpen(true)} className="flex-1 flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:border-green-500 bg-white">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            {isEmoji ? <span className="text-2xl">{safeValue}</span> : <img src={`https://api.iconify.design/${safeValue}.svg?color=${encodedColor}`} alt="" className="w-6 h-6" />}
          </div>
          <span className="text-gray-600 flex-1 text-left text-sm truncate">{safeValue}</span>
        </button>
        <input type="color" value={safeColor} onChange={(e) => onColorChange(e.target.value)} style={{ width: 56, height: 52, padding: 4, borderRadius: 8, border: '1px solid #d1d5db', cursor: 'pointer' }} title="เลือกสีไอคอน" />
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {presetColors.slice(0, 12).map(c => (
          <button key={c} onClick={() => onColorChange(c)} type="button" className={`w-6 h-6 rounded border-2 ${safeColor === c ? 'border-green-500' : 'border-gray-200'}`} style={{ background: c }} title={c} />
        ))}
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">เลือกไอคอน</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">{SvgIcons.close}</button>
              </div>
              <div className="relative">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาไอคอน เช่น bell, home, star..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{searching ? SvgIcons.spinner : SvgIcons.search}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {search ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-3">ผลการค้นหา ({results.length} ไอคอน)</h4>
                  {results.length > 0 ? (
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                      {results.map((icon) => (
                        <button key={icon} onClick={() => { onChange(icon); setIsOpen(false); setSearch(''); }} title={icon} className={`p-2 rounded-lg border-2 transition-all hover:border-green-500 hover:bg-green-50 ${safeValue === icon ? 'border-green-500 bg-green-50' : 'border-transparent bg-gray-50'}`}>
                          <img src={`https://api.iconify.design/${icon}.svg?color=${encodedColor}`} alt="" className="w-6 h-6 mx-auto" />
                        </button>
                      ))}
                    </div>
                  ) : !searching && <p className="text-gray-500 text-center py-8">ไม่พบไอคอน</p>}
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                    {iconCategories.map((cat, idx) => (
                      <button key={cat.name} onClick={() => setCategory(idx)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${category === idx ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {cat.name} ({cat.icons.length})
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                    {iconCategories[category].icons.map((icon) => (
                      <button key={icon} onClick={() => { onChange(icon); setIsOpen(false); }} title={icon} className={`p-2 rounded-lg border-2 transition-all hover:border-green-500 hover:bg-green-50 ${safeValue === icon ? 'border-green-500 bg-green-50' : 'border-transparent bg-gray-50'}`}>
                        <img src={`https://api.iconify.design/${icon}.svg?color=${encodedColor}`} alt="" className="w-6 h-6 mx-auto" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">หรือใส่ชื่อไอคอนเอง:</p>
                    <div className="flex gap-2">
                      <input type="text" value={safeValue} onChange={(e) => onChange(e.target.value)} placeholder="mdi:icon-name" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                      <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">ตกลง</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">ดูไอคอนเพิ่มที่ <a href="https://icon-sets.iconify.design/mdi/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Iconify MDI</a></p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// GradientPicker - เลือกสีพื้นหลังไอคอนด้วย Hue slider
function GradientPicker({ value, onChange, label }: { value: string | undefined | null; onChange: (v: string) => void; label: string; }) {
  // Parse hue จาก existing gradient หรือ hex color
  const parseHue = (val: string): number => {
    if (!val) return 45; // default: orange/yellow
    // ถ้าเป็น hsl
    const hslMatch = val.match(/hsl\((\d+)/);
    if (hslMatch) return parseInt(hslMatch[1]);
    // ถ้าเป็น hex color ใน gradient
    const hexMatch = val.match(/#([a-fA-F0-9]{6})/);
    if (hexMatch) {
      const hex = hexMatch[1];
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0;
      if (max !== min) {
        const d = max - min;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
      }
      return Math.round(h * 360);
    }
    return 45;
  };

  const [hue, setHue] = useState(() => parseHue(value || ''));

  // Generate gradient from hue
  const generateGradient = (h: number): string => {
    return `linear-gradient(135deg, hsl(${h}, 85%, 88%) 0%, hsl(${h}, 75%, 78%) 100%)`;
  };

  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    onChange(generateGradient(newHue));
  };

  const currentGradient = value || generateGradient(hue);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div 
          style={{ 
            width: 56, 
            height: 56, 
            background: currentGradient, 
            borderRadius: '50%',
            flexShrink: 0,
            border: '2px solid #e5e7eb'
          }} 
        />
        {/* Hue Slider */}
        <div className="flex-1">
          <input 
            type="range" 
            min={0} 
            max={360} 
            value={hue} 
            onChange={e => handleHueChange(+e.target.value)} 
            className="w-full h-4 rounded-lg appearance-none cursor-pointer"
            style={{ background: 'linear-gradient(to right, hsl(0,85%,83%), hsl(60,85%,83%), hsl(120,85%,83%), hsl(180,85%,83%), hsl(240,85%,83%), hsl(300,85%,83%), hsl(360,85%,83%))' }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Hue: {hue}°</span>
            <button 
              onClick={() => handleHueChange(45)} 
              className="text-green-600 hover:underline"
            >
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageSettingsPage() {
  // ใช้ DEFAULT เป็น initial state - ทุก field มีค่าเสมอตั้งแต่แรก
  const [s, setS] = useState<PageSettings>({ ...DEFAULT });
  const [isLoading, setIsLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false); // เพิ่ม flag ว่า data พร้อมแล้ว
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [token, setToken] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  // Helper functions - ป้องกัน undefined ทุกกรณี
  const str = (val: unknown, def = ''): string => (val !== undefined && val !== null && val !== '') ? String(val) : def;
  const num = (val: unknown, def: number): number => {
    if (val === null || val === undefined || val === '') return def;
    const n = Number(val);
    return !isNaN(n) ? n : def;
  };
  const bool = (val: unknown, def: boolean): boolean => val !== undefined && val !== null ? Boolean(val) : def;

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/page-settings');
      const data = await res.json();
      if (data.success && data.data) {
        // Merge กับ DEFAULT - กรอง null/undefined ออกเท่านั้น
        const merged = { ...DEFAULT };
        for (const key of Object.keys(DEFAULT) as (keyof PageSettings)[]) {
          const val = data.data[key];
          // ไม่ filter empty string - ให้รับเฉพาะ null/undefined
          if (val !== undefined && val !== null) {
            (merged as Record<string, unknown>)[key] = val;
          }
        }
        setS(merged);
      }
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (userData.success) setToken(userData.data.token);
    } catch (e) { console.error(e); }
    setIsLoading(false);
    setDataReady(true); // Mark data as ready
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const update = useCallback(<K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
    setS(prev => ({ ...prev, [key]: value }));
  }, []);

  const upload = async (file: File, type: 'logo' | 'bg') => {
    type === 'logo' ? setUploadingLogo(true) : setUploadingBg(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('type', type);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { update(type === 'logo' ? 'logo_url' : 'bg_image_url', data.data.url); Swal.fire({ icon: 'success', title: 'อัพโหลดสำเร็จ!', timer: 1500, showConfirmButton: false }); }
      else throw new Error(data.error);
    } catch (e) { Swal.fire({ icon: 'error', title: 'อัพโหลดไม่สำเร็จ', text: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' }); }
    type === 'logo' ? setUploadingLogo(false) : setUploadingBg(false);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/page-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      const data = await res.json();
      if (data.success) Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', timer: 1500, showConfirmButton: false });
      else throw new Error(data.error);
    } catch (e) { Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: e instanceof Error ? e.message : 'เกิดข้อผิดพลาด' }); }
    setIsSaving(false);
  };

  const reset = () => {
    Swal.fire({ title: 'รีเซ็ตการตั้งค่า?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#EF4444', confirmButtonText: 'รีเซ็ต', cancelButtonText: 'ยกเลิก' })
      .then(r => { if (r.isConfirmed) { setS({ ...DEFAULT }); Swal.fire({ icon: 'success', title: 'รีเซ็ตสำเร็จ!', timer: 1500, showConfirmButton: false }); } });
  };

  const btnGrad = `linear-gradient(135deg, hsl(${num(s.button_hue, 142)}, ${num(s.button_saturation, 71)}%, ${num(s.button_lightness, 45)}%) 0%, hsl(${num(s.button_hue, 142)}, ${num(s.button_saturation, 71)}%, ${Math.max(num(s.button_lightness, 45) - 10, 10)}%) 100%)`;

  // สร้าง button gradient สำหรับแต่ละ tab
  const getButtonGrad = (prefix: string) => {
    const hueKey = `${prefix}_button_hue` as keyof PageSettings;
    const satKey = `${prefix}_button_saturation` as keyof PageSettings;
    const lightKey = `${prefix}_button_lightness` as keyof PageSettings;
    const h = num(s[hueKey] as number, num(s.button_hue, 142));
    const sat = num(s[satKey] as number, num(s.button_saturation, 71));
    const l = num(s[lightKey] as number, num(s.button_lightness, 45));
    return `linear-gradient(135deg, hsl(${h}, ${sat}%, ${l}%) 0%, hsl(${h}, ${sat}%, ${Math.max(l - 10, 10)}%) 100%)`;
  };

  // Render สีปุ่มสำหรับแต่ละ tab
  const renderButtonColorPicker = (prefix: string, buttonText: string) => {
    const hueKey = `${prefix}_button_hue` as keyof PageSettings;
    const satKey = `${prefix}_button_saturation` as keyof PageSettings;
    const lightKey = `${prefix}_button_lightness` as keyof PageSettings;
    const h = num(s[hueKey] as number, num(s.button_hue, 142));
    const sat = num(s[satKey] as number, num(s.button_saturation, 71));
    const l = num(s[lightKey] as number, num(s.button_lightness, 45));
    const grad = `linear-gradient(135deg, hsl(${h}, ${sat}%, ${l}%) 0%, hsl(${h}, ${sat}%, ${Math.max(l - 10, 10)}%) 100%)`;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 สีปุ่ม</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Hue: {h}°</label>
            <input type="range" min={0} max={360} value={h} onChange={e => update(hueKey, +e.target.value)} className="w-full h-3 rounded-lg appearance-none cursor-pointer" style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Saturation: {sat}%</label>
            <input type="range" min={0} max={100} value={sat} onChange={e => update(satKey, +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Lightness: {l}%</label>
            <input type="range" min={20} max={80} value={l} onChange={e => update(lightKey, +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer" />
          </div>
          <div className="pt-2">
            <div className="text-sm text-gray-600 mb-2">ตัวอย่างปุ่ม:</div>
            <button style={{ background: grad, padding: '12px 24px', borderRadius: '10px', color: 'white', fontWeight: 600 }}>{buttonText}</button>
          </div>
        </div>
      </div>
    );
  };

  const getBgStyle = (): React.CSSProperties => {
    if (s.bg_type === 'image' && s.bg_image_url) return s.bg_image_overlay ? { backgroundImage: `linear-gradient(rgba(0,0,0,${num(s.bg_image_overlay_opacity, 40)/100}), rgba(0,0,0,${num(s.bg_image_overlay_opacity, 40)/100})), url(${s.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundImage: `url(${s.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (s.bg_type === 'gradient') return { background: `linear-gradient(${num(s.bg_gradient_angle, 135)}deg, hsl(${num(s.bg_hue, 142)}, ${num(s.bg_saturation, 71)}%, ${num(s.bg_lightness, 45)}%), hsl(${num(s.bg_gradient_hue2, 142)}, ${num(s.bg_gradient_saturation2, 76)}%, ${num(s.bg_gradient_lightness2, 36)}%))` };
    return { background: `hsl(${num(s.bg_hue, 142)}, ${num(s.bg_saturation, 71)}%, ${num(s.bg_lightness, 45)}%)` };
  };

  // ไม่ render จนกว่า data จะพร้อม
  if (isLoading || !dataReady) return <div className="flex items-center justify-center min-h-[400px]"><div className="text-center">{SvgIcons.spinner}<p className="mt-4 text-gray-600">กำลังโหลด...</p></div></div>;

  // File inputs - อยู่นอก conditional render
  const fileInputs = (
    <>
      <input key="logo-file" ref={logoRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'logo')} className="hidden" />
      <input key="bg-file" ref={bgRef} type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0], 'bg')} className="hidden" />
    </>
  );

  const renderDesign = () => (
    <div className="space-y-6" key="design-content">
      {fileInputs}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ พื้นหลัง</h3>
        <div className="space-y-4">
          <div className="flex gap-2">{(['solid', 'gradient', 'image'] as const).map(t => (<button key={t} onClick={() => update('bg_type', t)} className={`flex-1 py-2 px-4 rounded-lg font-medium ${s.bg_type === t ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t === 'solid' ? 'สีเดียว' : t === 'gradient' ? 'ไล่สี' : 'รูปภาพ'}</button>))}</div>
          {s.bg_type !== 'image' && (<>
            <div key="bg-hue"><label className="block text-sm text-gray-600 mb-2">Hue: {num(s.bg_hue, 142)}°</label><input type="range" min={0} max={360} value={num(s.bg_hue, 142)} onChange={e => update('bg_hue', +e.target.value)} className="w-full h-3 rounded-lg appearance-none cursor-pointer" style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} /></div>
            <div key="bg-sat"><label className="block text-sm text-gray-600 mb-2">Saturation: {num(s.bg_saturation, 71)}%</label><input type="range" min={0} max={100} value={num(s.bg_saturation, 71)} onChange={e => update('bg_saturation', +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg" /></div>
            <div key="bg-light"><label className="block text-sm text-gray-600 mb-2">Lightness: {num(s.bg_lightness, 45)}%</label><input type="range" min={20} max={80} value={num(s.bg_lightness, 45)} onChange={e => update('bg_lightness', +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg" /></div>
          </>)}
          {s.bg_type === 'gradient' && (<><hr key="hr" /><p key="p" className="text-sm font-medium text-gray-700">สีที่ 2</p>
            <div key="bg-hue2"><label className="block text-sm text-gray-600 mb-2">Hue 2: {num(s.bg_gradient_hue2, 142)}°</label><input type="range" min={0} max={360} value={num(s.bg_gradient_hue2, 142)} onChange={e => update('bg_gradient_hue2', +e.target.value)} className="w-full h-3 rounded-lg appearance-none" style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }} /></div>
            <div key="bg-angle"><label className="block text-sm text-gray-600 mb-2">มุมไล่สี: {num(s.bg_gradient_angle, 135)}°</label><input type="range" min={0} max={360} value={num(s.bg_gradient_angle, 135)} onChange={e => update('bg_gradient_angle', +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg" /></div>
          </>)}
          {s.bg_type === 'image' && (<div className="space-y-4" key="bg-image-section">
            <button onClick={() => bgRef.current?.click()} disabled={uploadingBg} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 flex items-center justify-center gap-2">{uploadingBg ? SvgIcons.spinner : SvgIcons.upload}<span>{uploadingBg ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปพื้นหลัง'}</span></button>
            {s.bg_image_url && (<div key="bg-preview" className="relative">
              <img src={s.bg_image_url} alt="" className="w-full h-32 object-cover rounded-lg" />
              <button onClick={() => update('bg_image_url', '')} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600">{SvgIcons.trash}</button>
            </div>)}
            {s.bg_image_url && <div key="overlay-check" className="flex items-center gap-2"><input type="checkbox" checked={bool(s.bg_image_overlay, true)} onChange={e => update('bg_image_overlay', e.target.checked)} id="overlay-check" /><label htmlFor="overlay-check" className="text-sm">เพิ่ม Overlay</label></div>}
            {bool(s.bg_image_overlay, true) && s.bg_image_url && <div key="overlay-opacity"><label className="block text-sm text-gray-600 mb-2">ความทึบ: {num(s.bg_image_overlay_opacity, 40)}%</label><input type="range" min={0} max={80} value={num(s.bg_image_overlay_opacity, 40)} onChange={e => update('bg_image_overlay_opacity', +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg" /></div>}
          </div>)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 โลโก้และข้อความหลัก</h3>
        <div className="space-y-4">
          <div key="logo-section">
            <label className="block text-sm font-medium text-gray-700 mb-2">โลโก้</label>
            {s.logo_url ? (
              <div key="logo-preview" className="mb-3">
                <div className="relative inline-block">
                  <img src={s.logo_url} alt="" style={{ width: num(s.logo_width, 120) }} className="max-h-20 object-contain rounded-lg border border-gray-200" />
                  <button onClick={() => update('logo_url', '')} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">{SvgIcons.trash}</button>
                </div>
                <div className="mt-3"><label className="block text-sm text-gray-600 mb-1">ขนาด: {num(s.logo_width, 120)}px</label><input type="range" min={60} max={300} value={num(s.logo_width, 120)} onChange={e => update('logo_width', +e.target.value)} className="w-full h-3 bg-gray-200 rounded-lg" /></div>
              </div>
            ) : (
              <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo} className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 flex items-center justify-center gap-2">{uploadingLogo ? SvgIcons.spinner : SvgIcons.upload}<span>{uploadingLogo ? 'กำลังอัพโหลด...' : 'อัพโหลดโลโก้'}</span></button>
            )}
            {s.logo_url && <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo} className="w-full mt-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">{uploadingLogo ? SvgIcons.spinner : SvgIcons.upload}<span>{uploadingLogo ? 'กำลังอัพโหลด...' : 'เปลี่ยนโลโก้'}</span></button>}
          </div>
          <TextInput key="page-title" label="หัวข้อหน้าเว็บ" value={str(s.page_title)} onChange={v => update('page_title', v)} />
          <TextInput key="page-subtitle" label="คำอธิบาย" value={str(s.page_subtitle)} onChange={v => update('page_subtitle', v)} />
        </div>
      </div>
    </div>
  );

  const renderSubscribe = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 เนื้อหา</h3>
        <div className="space-y-4">
          <IconPicker label="ไอคอน" value={str(s.subscribe_icon, 'mdi:bell')} color={str(s.subscribe_icon_color, '#f59e0b')} onChange={v => update('subscribe_icon', v)} onColorChange={v => update('subscribe_icon_color', v)} />
          <GradientPicker label="สีพื้นหลังไอคอน" value={str(s.subscribe_icon_bg)} onChange={v => update('subscribe_icon_bg', v)} />
          <TextInput label="หัวข้อ" value={str(s.subscribe_title)} onChange={v => update('subscribe_title', v)} />
          <TextInput label="คำอธิบาย" value={str(s.subscribe_subtitle)} onChange={v => update('subscribe_subtitle', v)} multiline />
          <TextInput label="ข้อความปุ่ม" value={str(s.subscribe_button_text)} onChange={v => update('subscribe_button_text', v)} />
          <TextInput label="ข้อความขณะโหลด" value={str(s.subscribe_loading_text)} onChange={v => update('subscribe_loading_text', v)} />
        </div>
      </div>
      {renderButtonColorPicker('subscribe', str(s.subscribe_button_text, 'สมัคร'))}
    </div>
  );

  const renderFooter = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {[1, 2, 3].map(n => {
        const iconKey = `footer_item${n}_icon` as keyof PageSettings;
        const colorKey = `footer_item${n}_icon_color` as keyof PageSettings;
        const textKey = `footer_item${n}_text` as keyof PageSettings;
        return (<div key={n} className={n > 1 ? "border-t pt-4" : ""}><p className="font-medium text-gray-700 mb-3">รายการที่ {n}</p><div className="space-y-3"><IconPicker label="ไอคอน" value={str(s[iconKey] as string, 'mdi:star')} color={str(s[colorKey] as string, '#3b82f6')} onChange={v => update(iconKey, v)} onColorChange={v => update(colorKey, v)} /><TextInput label="ข้อความ" value={str(s[textKey] as string)} onChange={v => update(textKey, v)} /></div></div>);
      })}
    </div>
  );

  const renderContent = (prefix: string, fields: { key: string; label: string; type: 'text' | 'icon' | 'textarea' | 'gradient' }[]) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="space-y-4">
      {fields.map(f => {
        const k = `${prefix}_${f.key}` as keyof PageSettings;
        const v = str(s[k] as string);
        if (f.type === 'icon') {
          const colorKey = `${prefix}_${f.key}_color` as keyof PageSettings;
          return <IconPicker key={f.key} label={f.label} value={v || 'mdi:star'} color={str(s[colorKey] as string, '#3b82f6')} onChange={x => update(k, x)} onColorChange={x => update(colorKey, x)} />;
        }
        if (f.type === 'gradient') {
          return <GradientPicker key={f.key} label={f.label} value={v} onChange={x => update(k, x)} />;
        }
        return <TextInput key={f.key} label={f.label} value={v} onChange={x => update(k, x)} multiline={f.type === 'textarea'} />;
      })}
    </div></div>
  );

  // Helper: แปลง newline เป็น <br/>
  const nl2br = (text: string) => text.replace(/\n/g, '<br/>');

  const renderPreview = () => {
    const iconStyle = (bg: string) => ({ width: 60, height: 60, background: bg || 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '50%', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, margin: '0 auto 12px' });
    const titleStyle = { fontSize: 16, fontWeight: 'bold' as const, color: '#1f2937', marginBottom: 6 };
    const subStyle = { color: '#6b7280', marginBottom: 16, fontSize: 12 };
    const getBtnStyle = (prefix: string) => ({ width: '100%', padding: '10px 16px', background: getButtonGrad(prefix), color: 'white', fontWeight: 600 as const, borderRadius: 10, border: 'none', fontSize: 14 });
    const content: Record<string, React.ReactNode> = {
      design: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.subscribe_icon_bg))}><IconDisplay icon={str(s.subscribe_icon, 'mdi:bell')} color={str(s.subscribe_icon_color, '#f59e0b')} /></div><h2 style={titleStyle}>{str(s.subscribe_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.subscribe_subtitle)) }} /><button style={getBtnStyle('subscribe')}>{str(s.subscribe_button_text)}</button></div>,
      subscribe: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.subscribe_icon_bg))}><IconDisplay icon={str(s.subscribe_icon, 'mdi:bell')} color={str(s.subscribe_icon_color, '#f59e0b')} /></div><h2 style={titleStyle}>{str(s.subscribe_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.subscribe_subtitle)) }} /><button style={getBtnStyle('subscribe')}>{str(s.subscribe_button_text)}</button></div>,
      success: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.success_icon_bg))}><IconDisplay icon={str(s.success_icon, 'mdi:check-circle')} color={str(s.success_icon_color, '#16a34a')} /></div><h2 style={titleStyle}>{str(s.success_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.success_subtitle)) }} /><div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 10, padding: 16, border: '1px solid #bbf7d0' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}><IconDisplay icon={str(s.success_box_icon, 'mdi:bell-ring')} color={str(s.success_box_icon_color, '#16a34a')} size={20} /><span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>{str(s.success_box_title)}</span></div><p style={{ fontSize: 11, color: '#166534', margin: 0 }} dangerouslySetInnerHTML={{ __html: nl2br(str(s.success_box_subtitle)) }} /></div></div>,
      blocked: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.blocked_icon_bg))}><IconDisplay icon={str(s.blocked_icon, 'mdi:bell-off')} color={str(s.blocked_icon_color, '#dc2626')} /></div><h2 style={titleStyle}>{str(s.blocked_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.blocked_subtitle)) }} /><button style={getBtnStyle('blocked')}>{str(s.blocked_button_text)}</button><div style={{ marginTop: 16, padding: 12, background: '#fefce8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><IconDisplay icon={str(s.blocked_tip_icon, 'mdi:lightbulb')} color={str(s.blocked_tip_icon_color, '#ca8a04')} size={16} /><span style={{ fontSize: 11, color: '#854d0e' }}>{str(s.blocked_tip_text)}</span></div></div>,
      ios_safari: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.ios_safari_icon_bg))}><IconDisplay icon={str(s.ios_safari_icon, 'mdi:cellphone')} color={str(s.ios_safari_icon_color, '#3b82f6')} /></div><h2 style={titleStyle}>{str(s.ios_safari_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.ios_safari_subtitle)) }} /><button style={getBtnStyle('ios_safari')}>{str(s.ios_safari_button_text)}</button></div>,
      ios_chrome: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.ios_chrome_icon_bg))}><IconDisplay icon={str(s.ios_chrome_icon, 'mdi:cellphone')} color={str(s.ios_chrome_icon_color, '#3b82f6')} /></div><h2 style={titleStyle}>{str(s.ios_chrome_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.ios_chrome_subtitle)) }} /><button style={getBtnStyle('ios_chrome')}>{str(s.ios_chrome_button_text)}</button></div>,
      ios_unsupported: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.ios_unsupported_icon_bg))}><IconDisplay icon={str(s.ios_unsupported_icon, 'mdi:apple-safari')} color={str(s.ios_unsupported_icon_color, '#3b82f6')} /></div><h2 style={titleStyle}>{str(s.ios_unsupported_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.ios_unsupported_subtitle)) }} /><button style={getBtnStyle('ios_unsupported')}>{str(s.ios_unsupported_button_text)}</button></div>,
      android_unsupported: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.android_unsupported_icon_bg))}><IconDisplay icon={str(s.android_unsupported_icon, 'mdi:google-chrome')} color={str(s.android_unsupported_icon_color, '#f59e0b')} /></div><h2 style={titleStyle}>{str(s.android_unsupported_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.android_unsupported_subtitle)) }} /><button style={getBtnStyle('android_unsupported')}>{str(s.android_unsupported_button_text)}</button></div>,
      footer: <div style={{ textAlign: 'center' }}><div style={iconStyle(str(s.subscribe_icon_bg))}><IconDisplay icon={str(s.subscribe_icon, 'mdi:bell')} color={str(s.subscribe_icon_color, '#f59e0b')} /></div><h2 style={titleStyle}>{str(s.subscribe_title)}</h2><p style={subStyle} dangerouslySetInnerHTML={{ __html: nl2br(str(s.subscribe_subtitle)) }} /><button style={getBtnStyle('subscribe')}>{str(s.subscribe_button_text)}</button><p style={{ fontSize: 10, color: '#9ca3af', marginTop: 12 }}>👇 ดู Footer ด้านล่าง</p></div>
    };
    return content[activeTab] || null;
  };

  // Map prefix to button text key
  const buttonTextMap: Record<string, string> = {
    success: 'success_title',
    blocked: 'blocked_button_text',
    ios_safari: 'ios_safari_button_text',
    ios_chrome: 'ios_chrome_button_text',
    ios_unsupported: 'ios_unsupported_button_text',
    android_unsupported: 'android_unsupported_button_text'
  };

  const renderTab = () => {
    if (activeTab === 'design') return renderDesign();
    if (activeTab === 'subscribe') return renderSubscribe();
    if (activeTab === 'footer') return renderFooter();
    const configs: Record<string, { key: string; label: string; type: 'text' | 'icon' | 'textarea' | 'gradient' }[]> = {
      success: [{ key: 'icon', label: 'ไอคอน', type: 'icon' }, { key: 'icon_bg', label: 'สีพื้นหลังไอคอน', type: 'gradient' }, { key: 'title', label: 'หัวข้อ (สมัครใหม่)', type: 'text' }, { key: 'title_existing', label: 'หัวข้อ (สมัครแล้ว)', type: 'text' }, { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' }, { key: 'box_icon', label: 'ไอคอนกล่อง', type: 'icon' }, { key: 'box_title', label: 'หัวข้อกล่อง', type: 'text' }, { key: 'box_subtitle', label: 'คำอธิบายกล่อง', type: 'textarea' }],
      blocked: [{ key: 'icon', label: 'ไอคอน', type: 'icon' }, { key: 'icon_bg', label: 'สีพื้นหลังไอคอน', type: 'gradient' }, { key: 'title', label: 'หัวข้อ', type: 'text' }, { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' }, { key: 'button_text', label: 'ข้อความปุ่ม', type: 'text' }, { key: 'tip_icon', label: 'ไอคอนคำแนะนำ', type: 'icon' }, { key: 'tip_text', label: 'คำแนะนำ', type: 'text' }],
      ios_safari: [{ key: 'icon', label: 'ไอคอน', type: 'icon' }, { key: 'icon_bg', label: 'สีพื้นหลังไอคอน', type: 'gradient' }, { key: 'title', label: 'หัวข้อ', type: 'text' }, { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' }, { key: 'button_text', label: 'ข้อความปุ่ม', type: 'text' }],
      ios_chrome: [{ key: 'icon', label: 'ไอคอน', type: 'icon' }, { key: 'icon_bg', label: 'สีพื้นหลังไอคอน', type: 'gradient' }, { key: 'title', label: 'หัวข้อ', type: 'text' }, { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' }, { key: 'button_text', label: 'ข้อความปุ่ม', type: 'text' }],
      ios_unsupported: [{ key: 'icon', label: 'ไอคอน', type: 'icon' }, { key: 'icon_bg', label: 'สีพื้นหลังไอคอน', type: 'gradient' }, { key: 'title', label: 'หัวข้อ', type: 'text' }, { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' }, { key: 'button_text', label: 'ข้อความปุ่ม', type: 'text' }, { key: 'copy_success', label: 'ข้อความคัดลอกสำเร็จ', type: 'text' }, { key: 'copy_hint', label: 'คำแนะนำหลังคัดลอก', type: 'text' }],
      android_unsupported: [{ key: 'icon', label: 'ไอคอน', type: 'icon' }, { key: 'icon_bg', label: 'สีพื้นหลังไอคอน', type: 'gradient' }, { key: 'title', label: 'หัวข้อ', type: 'text' }, { key: 'subtitle', label: 'คำอธิบาย', type: 'textarea' }, { key: 'button_text', label: 'ข้อความปุ่ม', type: 'text' }, { key: 'loading_text', label: 'ข้อความขณะโหลด', type: 'text' }, { key: 'copy_success', label: 'ข้อความคัดลอกสำเร็จ', type: 'text' }, { key: 'copy_hint', label: 'คำแนะนำหลังคัดลอก', type: 'text' }]
    };
    const btnTextKey = buttonTextMap[activeTab] as keyof PageSettings;
    const btnText = btnTextKey ? str(s[btnTextKey] as string, 'ปุ่ม') : 'ปุ่ม';
    // Success page ไม่มีปุ่มหลัก แต่เพิ่มสีปุ่มไว้เผื่อใช้ในอนาคต (hidden for now)
    const showButtonColor = activeTab !== 'success';
    return (
      <div className="space-y-6">
        {renderContent(activeTab, configs[activeTab] || [])}
        {showButtonColor && renderButtonColorPicker(activeTab, btnText)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">ตั้งค่าหน้าสมัครสมาชิก</h1><p className="text-gray-600 mt-1">ปรับแต่งดีไซน์และข้อความ</p></div>
        <div className="flex gap-3">
          {token && <a href={`/s/${token}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">{SvgIcons.external}<span>ดูตัวอย่างจริง</span></a>}
          <button onClick={reset} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">{SvgIcons.reset}<span>รีเซ็ต</span></button>
          <button onClick={save} disabled={isSaving} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50">{isSaving ? SvgIcons.spinner : SvgIcons.save}<span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span></button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-2"><div className="flex flex-wrap gap-2">{tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg font-medium ${activeTab === t.id ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{t.label}</button>)}</div></div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">{renderTab()}</div>
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ตัวอย่าง: {tabs.find(t => t.id === activeTab)?.label}</h3>
            <div className="rounded-xl overflow-hidden shadow-2xl" style={{ ...getBgStyle(), minHeight: 500, padding: '24px 16px' }}>
              {s.logo_url && (<div style={{ textAlign: 'center', marginBottom: 16 }}><img src={s.logo_url} alt="" style={{ width: s.logo_width, maxWidth: '100%', margin: '0 auto', display: 'block' }} /></div>)}
              <div style={{ textAlign: 'center', marginBottom: 20 }}><h1 style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 6, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{s.page_title}</h1><p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{s.page_subtitle}</p></div>
              <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                {renderPreview()}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', gap: 8 }}>
                    {[1, 2, 3].map(n => {
                      const iconKey = `footer_item${n}_icon` as keyof PageSettings;
                      const colorKey = `footer_item${n}_icon_color` as keyof PageSettings;
                      const textKey = `footer_item${n}_text` as keyof PageSettings;
                      const defaultIcons = ['mdi:newspaper', 'mdi:gift', 'mdi:lightning-bolt'];
                      const defaultColors = ['#3b82f6', '#22c55e', '#f59e0b'];
                      const defaultTexts = ['ข่าวสารล่าสุด', 'โปรโมชั่น', 'แจ้งเตือนทันที'];
                      return (
                        <div key={n} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <div style={{ width: 24, height: 24, marginBottom: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IconDisplay icon={str(s[iconKey] as string, defaultIcons[n-1])} color={str(s[colorKey] as string, defaultColors[n-1])} size={20} />
                          </div>
                          <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.3 }}>{str(s[textKey] as string, defaultTexts[n-1])}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}