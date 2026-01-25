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
