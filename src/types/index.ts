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

// Page Settings types
export interface PageSettings {
  id: number;
  admin_id: number;
  
  // Button Colors (HSL)
  button_hue: number;
  button_saturation: number;
  button_lightness: number;
  
  // Background Settings
  bg_type: 'solid' | 'gradient' | 'image';
  
  // Solid/Gradient colors (HSL)
  bg_hue: number;
  bg_saturation: number;
  bg_lightness: number;
  
  // Gradient settings
  bg_gradient_hue2: number;
  bg_gradient_saturation2: number;
  bg_gradient_lightness2: number;
  bg_gradient_angle: number;
  
  // Background Image
  bg_image_url?: string;
  bg_image_overlay: boolean;
  bg_image_overlay_opacity: number;
  
  // Logo
  logo_url?: string;
  logo_width: number;
  
  // Page Text
  page_title: string;
  page_subtitle: string;
  
  // =====================================================
  // SUBSCRIBE FORM PAGE
  // =====================================================
  subscribe_icon: string;
  subscribe_icon_bg: string;
  subscribe_title: string;
  subscribe_subtitle: string;
  subscribe_button_text: string;
  subscribe_loading_text: string;
  
  // =====================================================
  // SUCCESS PAGE
  // =====================================================
  success_icon: string;
  success_icon_bg: string;
  success_title: string;
  success_title_existing: string;
  success_subtitle: string;
  success_box_icon: string;
  success_box_title: string;
  success_box_subtitle: string;
  
  // =====================================================
  // BLOCKED/DENIED PAGE
  // =====================================================
  blocked_icon: string;
  blocked_icon_bg: string;
  blocked_title: string;
  blocked_subtitle: string;
  blocked_button_text: string;
  blocked_tip_icon: string;
  blocked_tip_text: string;
  
  // =====================================================
  // iOS SAFARI ADD TO HOME SCREEN
  // =====================================================
  ios_safari_icon: string;
  ios_safari_icon_bg: string;
  ios_safari_title: string;
  ios_safari_subtitle: string;
  ios_safari_button_text: string;
  
  // =====================================================
  // iOS CHROME ADD TO HOME SCREEN
  // =====================================================
  ios_chrome_icon: string;
  ios_chrome_icon_bg: string;
  ios_chrome_title: string;
  ios_chrome_subtitle: string;
  ios_chrome_button_text: string;
  
  // =====================================================
  // iOS UNSUPPORTED (in-app browser)
  // =====================================================
  ios_unsupported_icon: string;
  ios_unsupported_icon_bg: string;
  ios_unsupported_title: string;
  ios_unsupported_subtitle: string;
  ios_unsupported_button_text: string;
  ios_unsupported_button_telegram: string;
  ios_unsupported_button_copy: string;
  ios_unsupported_copy_success: string;
  ios_unsupported_copy_hint: string;
  
  // =====================================================
  // ANDROID UNSUPPORTED (in-app browser)
  // =====================================================
  android_unsupported_icon: string;
  android_unsupported_icon_bg: string;
  android_unsupported_title: string;
  android_unsupported_subtitle: string;
  android_unsupported_button_text: string;
  android_unsupported_loading_text: string;
  android_unsupported_copy_success: string;
  android_unsupported_copy_hint: string;
  
  // =====================================================
  // FOOTER SETTINGS
  // =====================================================
  footer_title: string;
  footer_item1_icon: string;
  footer_item1_text: string;
  footer_item2_icon: string;
  footer_item2_text: string;
  footer_item3_icon: string;
  footer_item3_text: string;
  
  created_at: Date;
  updated_at: Date;
}

export interface PageSettingsInput {
  button_hue?: number;
  button_saturation?: number;
  button_lightness?: number;
  bg_type?: 'solid' | 'gradient' | 'image';
  bg_hue?: number;
  bg_saturation?: number;
  bg_lightness?: number;
  bg_gradient_hue2?: number;
  bg_gradient_saturation2?: number;
  bg_gradient_lightness2?: number;
  bg_gradient_angle?: number;
  bg_image_url?: string;
  bg_image_overlay?: boolean;
  bg_image_overlay_opacity?: number;
  logo_url?: string;
  logo_width?: number;
  page_title?: string;
  page_subtitle?: string;
  
  // Subscribe Form
  subscribe_icon?: string;
  subscribe_icon_bg?: string;
  subscribe_title?: string;
  subscribe_subtitle?: string;
  subscribe_button_text?: string;
  subscribe_loading_text?: string;
  
  // Success Page
  success_icon?: string;
  success_icon_bg?: string;
  success_title?: string;
  success_title_existing?: string;
  success_subtitle?: string;
  success_box_icon?: string;
  success_box_title?: string;
  success_box_subtitle?: string;
  
  // Blocked Page
  blocked_icon?: string;
  blocked_icon_bg?: string;
  blocked_title?: string;
  blocked_subtitle?: string;
  blocked_button_text?: string;
  blocked_tip_icon?: string;
  blocked_tip_text?: string;
  
  // iOS Safari
  ios_safari_icon?: string;
  ios_safari_icon_bg?: string;
  ios_safari_title?: string;
  ios_safari_subtitle?: string;
  ios_safari_button_text?: string;
  
  // iOS Chrome
  ios_chrome_icon?: string;
  ios_chrome_icon_bg?: string;
  ios_chrome_title?: string;
  ios_chrome_subtitle?: string;
  ios_chrome_button_text?: string;
  
  // iOS Unsupported
  ios_unsupported_icon?: string;
  ios_unsupported_icon_bg?: string;
  ios_unsupported_title?: string;
  ios_unsupported_subtitle?: string;
  ios_unsupported_button_text?: string;
  ios_unsupported_button_telegram?: string;
  ios_unsupported_button_copy?: string;
  ios_unsupported_copy_success?: string;
  ios_unsupported_copy_hint?: string;
  
  // Android Unsupported
  android_unsupported_icon?: string;
  android_unsupported_icon_bg?: string;
  android_unsupported_title?: string;
  android_unsupported_subtitle?: string;
  android_unsupported_button_text?: string;
  android_unsupported_loading_text?: string;
  android_unsupported_copy_success?: string;
  android_unsupported_copy_hint?: string;
  
  // Footer
  footer_title?: string;
  footer_item1_icon?: string;
  footer_item1_text?: string;
  footer_item2_icon?: string;
  footer_item2_text?: string;
  footer_item3_icon?: string;
  footer_item3_text?: string;
}