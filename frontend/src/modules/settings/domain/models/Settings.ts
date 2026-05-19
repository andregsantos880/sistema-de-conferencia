/**
 * Settings Domain Models
 * 
 * These types represent the domain entities for the Settings module.
 * They are used throughout the application and may differ from API DTOs.
 */

// ============================================================================
// Profile
// ============================================================================

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
}

// ============================================================================
// Account
// ============================================================================

export interface AccountSettings {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UpdateAccountDto {
  twoFactorEnabled?: boolean;
}

// ============================================================================
// Billing
// ============================================================================

export interface Plan {
  name: string;
  price: number;
  interval: 'month' | 'year';
  nextPayment: string;
  features: {
    projects: string;
    storage: string;
    teamMembers: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: number;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface BillingInfo {
  plan: Plan;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
}

// ============================================================================
// Security
// ============================================================================

export interface Session {
  id: string;
  device: string;
  lastActive: string;
  isActive: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  keyMasked: string;
  createdAt: string;
}

export interface SecuritySettings {
  sessions: Session[];
  apiKeys: ApiKey[];
}

export interface CreateApiKeyDto {
  name: string;
}

// ============================================================================
// Connected Apps
// ============================================================================

export interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  icon: string;
}

// ============================================================================
// Notifications
// ============================================================================

export interface QuietHours {
  start: string;
  end: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  marketingEmails: boolean;
  quietHours: QuietHours;
}

export interface UpdateNotificationsDto {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  weeklyDigest?: boolean;
  productUpdates?: boolean;
  marketingEmails?: boolean;
  quietHours?: QuietHours;
}

// ============================================================================
// Preferences
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en-US' | 'es' | 'fr' | 'de' | 'pt-BR';

export interface UserPreferences {
  theme: Theme;
  language: Language;
  timezone: string;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export interface UpdatePreferencesDto {
  theme?: Theme;
  language?: Language;
  timezone?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
}
