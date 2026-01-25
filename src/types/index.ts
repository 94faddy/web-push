// Subscriber types
export interface Subscriber {
  id: number;
  admin_id: number | null;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  ip_address?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_push_at?: Date;
}

// Push log types
export interface PushLog {
  id: number;
  admin_id: number | null;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  tag?: string;
  total_sent: number;
  total_success: number;
  total_failed: number;
  total_clicks: number;
  sent_by: string;
  created_at: Date;
}

// Push delivery types
export interface PushDelivery {
  id: number;
  push_log_id: number;
  subscriber_id: number;
  status: 'success' | 'failed' | 'expired';
  error_message?: string;
  created_at: Date;
}

// Admin types
export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  token: string;
  display_name?: string;
  email?: string;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

// Admin Session types
export interface AdminSession {
  id: number;
  admin_id: number;
  session_token: string;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Template types
export interface Template {
  id: number;
  admin_id: number;
  name: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Click tracking types
export interface ClickTracking {
  id: number;
  push_log_id: number;
  subscriber_id?: number;
  admin_id?: number;
  clicked_url?: string;
  user_agent?: string;
  ip_address?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  created_at: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Subscription input types
export interface SubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  adminToken?: string;
}

// Push notification input types
export interface PushNotificationInput {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  tag?: string;
}

// Stats types
export interface DashboardStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalPushSent: number;
  totalClicks: number;
  successRate: number;
  clickRate: number;
  recentPushes: PushLog[];
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browserStats: {
    [key: string]: number;
  };
  dailyStats: {
    date: string;
    subscribers: number;
    pushes: number;
    clicks: number;
  }[];
}

// Auth types
export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  displayName: string | null;
  token: string;
  email: string | null;
}

// Template input types
export interface TemplateInput {
  name: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
}

// Landing Page Config types
export interface LandingPageConfig {
  id: number;
  admin_id: number;
  
  // Page Settings
  page_title: string;
  page_subtitle: string;
  
  // Background Settings (supports HSL)
  bg_type: 'color' | 'gradient' | 'image';
  bg_color: string;
  bg_gradient_start: string;
  bg_gradient_end: string;
  bg_gradient_direction: string;
  bg_image_url?: string;
  bg_overlay_color: string;
  
  // Card Settings
  card_bg_color: string;
  card_border_radius: number;
  card_shadow: string;
  
  // Main Icon/Image
  main_icon_type: 'emoji' | 'image' | 'none';
  main_icon_emoji: string;
  main_icon_image_url?: string;
  main_icon_size: number;
  
  // Success Icon
  success_icon_type: 'emoji' | 'image' | 'checkmark';
  success_icon_emoji: string;
  success_icon_image_url?: string;
  success_icon_color: string;
  
  // Content Texts
  subscribe_title: string;
  subscribe_description: string;
  subscribed_title: string;
  subscribed_description: string;
  subscribed_message: string;
  
  // Success Button (ปุ่มหลังสมัครสำเร็จ)
  success_button_text: string | null;
  success_button_url: string | null;
  
  // Button Settings (supports HSL)
  button_text: string;
  button_loading_text: string;
  button_bg_color: string;
  button_text_color: string;
  button_hover_color: string;
  button_border_radius: number;
  button_shadow: string;
  
  // Features Section
  show_features: boolean;
  features_title: string;
  feature_1_icon: string;
  feature_1_text: string;
  feature_1_image_url?: string;
  feature_2_icon: string;
  feature_2_text: string;
  feature_2_image_url?: string;
  feature_3_icon: string;
  feature_3_text: string;
  feature_3_image_url?: string;
  
  // Promo Banner
  show_promo_banner: boolean;
  promo_banner_image_url?: string;
  promo_banner_link?: string;
  promo_banner_position: 'top' | 'bottom' | 'above-button' | 'below-button';
  
  // Logo
  show_logo: boolean;
  logo_url?: string;
  logo_width: number;
  logo_height: number;
  
  // Footer
  show_footer: boolean;
  footer_text?: string;
  footer_link?: string;
  footer_text_color: string;
  
  // Template
  template_id?: number;
  custom_css?: string;
  
  // Timestamps
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Landing Page Template (preset templates)
export interface LandingPageTemplate {
  id: number;
  name: string;
  category: string;
  preview_image?: string;
  config: Partial<LandingPageConfig>;
  is_premium: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
}

// Upload types
export interface Upload {
  id: number;
  admin_id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type?: string;
  category: 'icon' | 'background' | 'promo' | 'logo' | 'feature' | 'other';
  created_at: Date;
}

// Default landing page config
export const defaultLandingPageConfig: Omit<LandingPageConfig, 'id' | 'admin_id' | 'created_at' | 'updated_at'> = {
  page_title: 'Web Push Notifications',
  page_subtitle: 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา',
  
  bg_type: 'gradient',
  bg_color: 'hsl(142, 71%, 45%)',
  bg_gradient_start: 'hsl(142, 71%, 45%)',
  bg_gradient_end: 'hsl(142, 76%, 36%)',
  bg_gradient_direction: '135deg',
  bg_overlay_color: 'rgba(0,0,0,0.3)',
  
  card_bg_color: 'hsl(0, 0%, 100%)',
  card_border_radius: 16,
  card_shadow: '0 10px 40px rgba(0,0,0,0.2)',
  
  main_icon_type: 'emoji',
  main_icon_emoji: '🔔',
  main_icon_size: 48,
  
  success_icon_type: 'checkmark',
  success_icon_emoji: '✅',
  success_icon_color: 'hsl(142, 71%, 45%)',
  
  subscribe_title: 'รับการแจ้งเตือน',
  subscribe_description: 'สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร',
  subscribed_title: 'คุณกำลังรับการแจ้งเตือน',
  subscribed_description: 'คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา',
  subscribed_message: 'ระบบจะส่งการแจ้งเตือนให้คุณเมื่อมีข่าวสารใหม่',
  
  // Success Button (ไม่แสดงโดย default)
  success_button_text: null,
  success_button_url: null,
  
  button_text: '🔔 สมัครรับการแจ้งเตือน',
  button_loading_text: 'กำลังดำเนินการ...',
  button_bg_color: 'hsl(142, 71%, 45%)',
  button_text_color: 'hsl(0, 0%, 100%)',
  button_hover_color: 'hsl(142, 76%, 36%)',
  button_border_radius: 12,
  button_shadow: '0 4px 14px rgba(34,197,94,0.4)',
  
  show_features: true,
  features_title: 'สิ่งที่คุณจะได้รับ',
  feature_1_icon: '📰',
  feature_1_text: 'ข่าวสารล่าสุด',
  feature_2_icon: '🎁',
  feature_2_text: 'โปรโมชั่น',
  feature_3_icon: '⚡',
  feature_3_text: 'แจ้งเตือนทันที',
  
  show_promo_banner: false,
  promo_banner_position: 'bottom',
  
  show_logo: false,
  logo_width: 120,
  logo_height: 40,
  
  show_footer: false,
  footer_text_color: 'hsl(0, 0%, 60%)',
  
  is_active: true
};