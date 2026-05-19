/**
 * Core Shipment entity with all tracking information
 */
export interface Shipment {
  // Identity
  id: string;
  trackingNumber: string;
  orderId: string; // Linked order reference
  
  // Route Information
  origin: Location;
  destination: Location;
  currentLocation: Location | null;
  
  // Status
  status: ShipmentStatus;
  priority: ShipmentPriority;
  
  // Timing
  createdAt: string;
  shippingDate: string; // When shipment was initiated
  pickupDate: string | null;
  departureTime: string | null; // Actual departure from origin
  estimatedDelivery: string;
  actualDelivery: string | null;
  
  // Carrier & Service
  carrier: Carrier;
  serviceType: ServiceType;
  
  // Package Details
  package: PackageDetails;
  
  // Progress
  progress: number;
  route: RouteSegment[];
  events: ShipmentEvent[];
  
  // Metadata
  customer: CustomerInfo;
  notes: string | null;
  tags: string[];
  alerts: ShipmentAlert[]; // Warning/info messages
  
  // Computed/Additional Info
  lateDurationMinutes?: number;
}

/**
 * Geographic location with coordinates
 */
export interface Location {
  city: string;
  state: string;
  country: string;
  postalCode: string;
  address: string;
  latitude: number;
  longitude: number;
  displayName: string;
  timezone: string;
}

/**
 * Shipment status enumeration
 */
export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  EXCEPTION = 'exception',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

/**
 * Shipment priority levels
 */
export enum ShipmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Service type/speed
 */
export enum ServiceType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  OVERNIGHT = 'overnight',
  SAME_DAY = 'same_day',
  INTERNATIONAL = 'international'
}

/**
 * Carrier information
 */
export interface Carrier {
  id: string;
  name: string;
  code: string;
  logo: string;
  trackingUrlPattern: string;
}

/**
 * Package details
 */
export interface PackageDetails {
  weight: number;
  weightUnit: 'lbs' | 'kg';
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  quantity: number;
  value: number;
  insurance: boolean;
  signature: boolean;
  fragile: boolean;
  description: string;
}

/**
 * Route segment for visualization
 */
export interface RouteSegment {
  from: Location;
  to: Location;
  distance: number;
  distanceUnit?: 'mi' | 'km';
  duration: number;
  durationUnit?: 'min' | 'h';
  completed: boolean;
  path: [number, number][];
}

/**
 * Shipment event/checkpoint
 */
export interface ShipmentEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location: Location;
  description: string;
  details: string | null;
  handler: string | null;
  photos: string[];
}

/**
 * Customer information
 */
export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
}

/**
 * Shipment alert/warning message
 */
export interface ShipmentAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

/**
 * Dashboard metrics aggregate
 */
export interface ShipmentMetrics {
  total: number;
  active: number;
  inTransit: number;
  delayed: number;
  delivered: number;
  activeTrend: number;
  inTransitTrend: number;
  deliveredTrend: number;
  
  // Analytics
  onTimeDeliveryRate: {
    value: number;
    trend: number;
  };
  averageDeliveryTime: {
    value: number;
    unit: string;
    trend: number;
  };
  delayedTrend: {
      value: number;
      trend: number; // minutes or count change
  };
  dailyStats: {
      date: string;
      onTime: number;
      delayed: number;
      exception: number;
  }[];
}

/**
 * Status configuration for UI
 */
export interface StatusConfig {
  status: ShipmentStatus;
  label: string;
  color: string;
  icon: string;
  badgeVariant: 'default' | 'success' | 'warning' | 'destructive';
}
