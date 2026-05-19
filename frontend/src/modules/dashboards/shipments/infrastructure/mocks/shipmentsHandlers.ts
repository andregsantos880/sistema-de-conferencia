import { http, delay } from 'msw';
import { ok, fail } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import { daysAgo, hoursAgo } from '@/mocks/utils/demoDate';
import {
  ShipmentStatus,
  ShipmentPriority,
  ServiceType,
  type Shipment,
  type ShipmentMetrics,
  type Carrier,
  type Location,
} from '../../domain/models';

// ============================================================================
// Mock Carriers
// ============================================================================

const mockCarriers: Carrier[] = [
  {
    id: 'fedex',
    name: 'FedEx',
    code: 'FEDEX',
    logo: '/carriers/fedex.svg',
    trackingUrlPattern: 'https://www.fedex.com/fedextrack/?trknbr={trackingNumber}',
  },
  {
    id: 'ups',
    name: 'UPS',
    code: 'UPS',
    logo: '/carriers/ups.svg',
    trackingUrlPattern: 'https://wwwapps.ups.com/tracking/tracking.cgi?tracknum={trackingNumber}',
  },
  {
    id: 'dhl',
    name: 'DHL',
    code: 'DHL',
    logo: '/carriers/dhl.svg',
    trackingUrlPattern: 'https://www.dhl.com/en/express/tracking.html?AWB={trackingNumber}',
  },
  {
    id: 'usps',
    name: 'USPS',
    code: 'USPS',
    logo: '/carriers/usps.svg',
    trackingUrlPattern: 'https://tools.usps.com/go/TrackConfirmAction?tLabels={trackingNumber}',
  },
];

// ============================================================================
// Mock Locations
// ============================================================================

const mockLocations: Location[] = [
  {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    postalCode: '94102',
    address: '123 Market St',
    latitude: 37.7749,
    longitude: -122.4194,
    displayName: 'SF, CA',
    timezone: 'America/Los_Angeles',
  },
  {
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    postalCode: '90001',
    address: '456 Main St',
    latitude: 34.0522,
    longitude: -118.2437,
    displayName: 'LA, CA',
    timezone: 'America/Los_Angeles',
  },
  {
    city: 'Phoenix',
    state: 'AZ',
    country: 'USA',
    postalCode: '85001',
    address: '789 Central Ave',
    latitude: 33.4484,
    longitude: -112.0740,
    displayName: 'Phoenix, AZ',
    timezone: 'America/Phoenix',
  },
  {
    city: 'Denver',
    state: 'CO',
    country: 'USA',
    postalCode: '80201',
    address: '321 Broadway',
    latitude: 39.7392,
    longitude: -104.9903,
    displayName: 'Denver, CO',
    timezone: 'America/Denver',
  },
  {
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    postalCode: '78701',
    address: '555 Congress Ave',
    latitude: 30.2672,
    longitude: -97.7431,
    displayName: 'Austin, TX',
    timezone: 'America/Chicago',
  },
  {
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    postalCode: '60601',
    address: '100 State St',
    latitude: 41.8781,
    longitude: -87.6298,
    displayName: 'Chicago, IL',
    timezone: 'America/Chicago',
  },
  {
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    address: '42 Broadway',
    latitude: 40.7128,
    longitude: -74.0060,
    displayName: 'NYC, NY',
    timezone: 'America/New_York',
  },
  {
    city: 'Las Vegas',
    state: 'NV',
    country: 'USA',
    postalCode: '89101',
    address: '200 Fremont St',
    latitude: 36.1699,
    longitude: -115.1398,
    displayName: 'Las Vegas, NV',
    timezone: 'America/Los_Angeles',
  },
  {
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    postalCode: '98101',
    address: '1000 Pike St',
    latitude: 47.6062,
    longitude: -122.3321,
    displayName: 'Seattle, WA',
    timezone: 'America/Los_Angeles',
  },
  {
    city: 'Miami',
    state: 'FL',
    country: 'USA',
    postalCode: '33101',
    address: '888 Biscayne Blvd',
    latitude: 25.7617,
    longitude: -80.1918,
    displayName: 'Miami, FL',
    timezone: 'America/New_York',
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateTrackingNumber(prefix: string, index: number): string {
  return `${prefix}${(123456 + index).toString().padStart(6, '0')}`;
}

function calculateDistance(from: Location, to: Location): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generateRoutePath(from: Location, to: Location): [number, number][] {
  // Simple straight line path with 3 intermediate points
  const steps = 5;
  const path: [number, number][] = [];
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = from.latitude + (to.latitude - from.latitude) * ratio;
    const lng = from.longitude + (to.longitude - from.longitude) * ratio;
    path.push([lat, lng]);
  }
  
  return path;
}

// ============================================================================
// Mock Shipment Generation
// ============================================================================

// Deterministic random number generator based on seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateShipment(id: number, forcedStatus?: ShipmentStatus): Shipment {
  // Use distinct seeds for different properties to ensure variety
  const originIndex = Math.floor(seededRandom(id * 17) * mockLocations.length);
  let destinationIndex = Math.floor(seededRandom(id * 23) * mockLocations.length);
  
  // Ensure origin != destination
  if (originIndex === destinationIndex) {
    destinationIndex = (destinationIndex + 1) % mockLocations.length;
  }
  
  const originBase = mockLocations[originIndex];
  const destinationBase = mockLocations[destinationIndex];
  
  // Add Jitter to coordinates to avoid exact stacking (helps clustering)
  // +/- 0.06 degrees is roughly 6km radius dispersion
  const jitterLat = (seededRandom(id * 101) - 0.5) * 0.24; 
  const jitterLng = (seededRandom(id * 102) - 0.5) * 0.24;
  
  const origin: Location = {
    ...originBase,
    latitude: originBase.latitude + jitterLat,
    longitude: originBase.longitude + jitterLng,
  };
  
  const destination: Location = {
    ...destinationBase,
    latitude: destinationBase.latitude + jitterLat, // Jitter destination too
    longitude: destinationBase.longitude + jitterLng,
  };
  
  // Status logic
  let status: ShipmentStatus;
  if (forcedStatus) {
    status = forcedStatus;
  } else {
    // Fallback if not forced (shouldn't happen with new logic)
    const statusSeed = seededRandom(id * 43);
    if (statusSeed < 0.4) status = ShipmentStatus.IN_TRANSIT;
    else if (statusSeed < 0.6) status = ShipmentStatus.DELIVERED;
    else status = ShipmentStatus.DELAYED;
  }

  const priorities: ShipmentPriority[] = [
    ShipmentPriority.LOW,
    ShipmentPriority.LOW,
    ShipmentPriority.MEDIUM,
    ShipmentPriority.MEDIUM,
    ShipmentPriority.MEDIUM,
    ShipmentPriority.HIGH,
    ShipmentPriority.URGENT,
  ];
  const priority = priorities[Math.floor(seededRandom(id * 7) * priorities.length)];
  
  const serviceTypes: ServiceType[] = [
    ServiceType.STANDARD,
    ServiceType.STANDARD,
    ServiceType.EXPRESS,
    ServiceType.OVERNIGHT,
    ServiceType.SAME_DAY,
  ];
  const serviceType = serviceTypes[Math.floor(seededRandom(id * 13) * serviceTypes.length)];
  
  const carrier = mockCarriers[Math.floor(seededRandom(id * 5) * mockCarriers.length)];
  
  const trackingPrefixes = ['EXP', 'US', 'DE', 'JP'];
  const trackingNumber = generateTrackingNumber(
    trackingPrefixes[Math.floor(seededRandom(id * 3) * trackingPrefixes.length)],
    id
  );
  
  const createdAt = daysAgo(id % 30);
  const estimatedDelivery = hoursAgo(-(2 + (id % 48))); // Future time
  
  const distance = calculateDistance(origin, destination);
  // Duration in MINUTES: distance in miles / 50 mph * 60 min/hour
  const duration = Math.floor((distance / 50) * 60); // Convert hours to minutes
  
  // Calculate progress based on status
  let progress = 0;
  if (status === ShipmentStatus.DELIVERED) progress = 100;
  else if (status === ShipmentStatus.OUT_FOR_DELIVERY) progress = 90 + Math.floor(seededRandom(id * 10) * 10);
  else if (status === ShipmentStatus.IN_TRANSIT) {
    // Generate varied progress between 15% and 85% instead of sequential
    progress = 15 + Math.floor(seededRandom(id * 79) * 70); 
  }
  else progress = Math.floor(seededRandom(id * 5) * 15);
  
  // Calculate current location for in-transit shipments
  let currentLocation: Location | null = null;
  if (status === ShipmentStatus.IN_TRANSIT) {
    const progressRatio = progress / 100;
    currentLocation = {
      ...origin,
      latitude: origin.latitude + (destination.latitude - origin.latitude) * progressRatio,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * progressRatio,
      displayName: 'En route',
      city: 'En route',
      state: '',
      country: '',
      postalCode: '',
      address: '',
      timezone: '',
    };
  }
  
  // Generate contextual alerts based on status and other factors
  const alerts = [];
  
  // Delayed shipments - critical warnings
  if (status === ShipmentStatus.DELAYED) {
    const delayReasons = [
      'High volume. During peak seasons like holidays, there can be a significant increase in the number of packages being shipped, leading to delays.',
      'Weather conditions in the destination area may cause delivery delays. We are monitoring the situation closely.',
      'Unexpected customs inspection. Your international shipment is undergoing additional screening. Updates will follow shortly.',
    ];
    alerts.push({
      id: `alert-${id}-1`,
      type: 'warning' as const,
      message: delayReasons[id % delayReasons.length],
      timestamp: hoursAgo(2),
    });
  }
  
  // In transit - informational updates
  if (status === ShipmentStatus.IN_TRANSIT) {
    const transitAlerts = [
      'Your package is on schedule and proceeding smoothly to its destination.',
      'Package cleared customs inspection successfully. Continuing to final destination.',
      'Currently in transit. Next update expected within the next 4-6 hours.',
      'Your shipment is being transported via ground service and is making good progress.',
    ];
    if (id % 3 === 0) { // Add alerts to some shipments
      alerts.push({
        id: `alert-${id}-1`,
        type: 'info' as const,
        message: transitAlerts[id % transitAlerts.length],
        timestamp: hoursAgo(1),
      });
    }
  }
  
  // Out for delivery - delivery window information
  if (status === ShipmentStatus.OUT_FOR_DELIVERY) {
    const deliveryTime = new Date();
    deliveryTime.setHours(deliveryTime.getHours() + 2 + (id % 4));
    const startTime = deliveryTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    deliveryTime.setHours(deliveryTime.getHours() + 2);
    const endTime = deliveryTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    alerts.push({
      id: `alert-${id}-1`,
      type: 'info' as const,
      message: `Your package is out for delivery. Expected delivery window: ${startTime} - ${endTime}. Driver will attempt delivery once.`,
      timestamp: hoursAgo(0.5),
    });
  }
  
  // Delivered - completion info
  if (status === ShipmentStatus.DELIVERED) {
    const deliveryConfirmations = [
      'Package delivered successfully. Signature obtained and on file.',
      'Delivered to front door. Photo proof of delivery available in tracking details.',
      'Package delivered and received by resident. Thank you for your business!',
    ];
    alerts.push({
      id: `alert-${id}-1`,
      type: 'info' as const,
      message: deliveryConfirmations[id % deliveryConfirmations.length],
      timestamp: hoursAgo(id % 24),
    });
  }
  
  // High priority or fragile items - special handling alerts
  if (priority === ShipmentPriority.HIGH || priority === ShipmentPriority.URGENT) {
    if (id % 2 === 0 && status !== ShipmentStatus.DELIVERED) {
      alerts.push({
        id: `alert-${id}-priority`,
        type: 'info' as const,
        message: 'Priority shipment: This package is being expedited and tracked closely to ensure on-time delivery.',
        timestamp: hoursAgo(3),
      });
    }
  }
  
  return {
    id: `shp-${id}`,
    trackingNumber,
    orderId: `Order-${12000 + id}`, // Generate order ID
    status,
    priority,
    origin,
    destination,
    currentLocation,
    carrier,
    serviceType,
    createdAt,
    shippingDate: createdAt, // Shipping date is when order was created
    pickupDate: status !== ShipmentStatus.PENDING ? daysAgo((id % 29) + 1) : null,
    departureTime: status !== ShipmentStatus.PENDING ? hoursAgo((id % 48) + 2) : null, // Departed few hours after pickup
    estimatedDelivery,
    actualDelivery: status === ShipmentStatus.DELIVERED ? daysAgo(id % 7) : null,
    package: {
      weight: 5 + (id % 20),
      weightUnit: 'lbs',
      dimensions: {
        length: 12 + (id % 12),
        width: 8 + (id % 8),
        height: 6 + (id % 6),
        unit: 'in',
      },
      quantity: 1 + (id % 3),
      value: 100 + (id % 500),
      insurance: id % 3 === 0,
      signature: priority === ShipmentPriority.HIGH || priority === ShipmentPriority.URGENT,
      fragile: id % 5 === 0,
      description: `Package ${id}`,
    },
    progress,
    route: [
      {
        from: origin,
        to: destination,
        distance,
        duration, // Now properly in minutes
        durationUnit: 'min', // Added default
        distanceUnit: 'mi', // Added default
        completed: status === ShipmentStatus.DELIVERED,
        path: generateRoutePath(origin, destination),
      } as any, // Cast to avoid strict interface check mismatches if any
    ],
    events: [
      {
        id: `evt-${id}-1`,
        timestamp: createdAt,
        status: ShipmentStatus.PENDING,
        location: origin,
        description: 'Order Placed',
        details: 'Shipment information received by seller',
        handler: 'Seller',
        photos: [],
      },
      {
        id: `evt-${id}-2`,
        timestamp: hoursAgo((id % 48) + 1),
        status: ShipmentStatus.PENDING,
        location: origin,
        description: 'Preparing to ship',
        details: 'Seller is preparing to ship you order',
        handler: 'Seller',
        photos: [],
      },
      {
        id: `evt-${id}-3`,
        timestamp: hoursAgo((id % 48)),
        status: ShipmentStatus.PICKED_UP,
        location: origin,
        description: 'Confirm Shipment',
        details: 'Shipment information received by carrier',
        handler: carrier.name,
        photos: [],
      },
      {
        id: `evt-${id}-4`,
        timestamp: hoursAgo((id % 47)),
        status: ShipmentStatus.PICKED_UP,
        location: origin,
        description: 'Picked up',
        details: `Package picked up by ${carrier.name}`,
        handler: carrier.name,
        photos: [],
      },
    ],
    customer: {
      id: `cust-${id}`,
      name: `Customer ${id}`,
      email: `customer${id}@example.com`,
      phone: `+1-555-${(1000 + id).toString().substring(0, 4)}`,
      company: id % 3 === 0 ? `Company ${id}` : null,
    },
    notes: id % 5 === 0 ? 'Handle with care' : null,
    tags: priority === ShipmentPriority.HIGH ? ['priority'] : [],
    alerts, // Use the generated alerts array
    // Add late duration for delayed items (15 to 120 mins)
    lateDurationMinutes: status === ShipmentStatus.DELAYED ? 15 + Math.floor(seededRandom(id * 99) * 105) : undefined,
  };
}

// Generate smaller, controlled dataset
function generateMockData(): Shipment[] {
  const shipments: Shipment[] = [];
  let idCounter = 0;
  
  // Random count between 3 and 12 for each status group
  const statuses = [
    ShipmentStatus.IN_TRANSIT, 
    ShipmentStatus.DELIVERED, 
    ShipmentStatus.DELAYED
  ];
  
  statuses.forEach(status => {
    // Generate random count 3-12 using standard random since this runs once on init
    const count = Math.floor(Math.random() * 10) + 3;
    for(let i = 0; i < count; i++) {
      shipments.push(generateShipment(idCounter++, status));
    }
  });

  return shipments;
}

const mockShipments = generateMockData();

// ============================================================================
// Helper: Calculate Metrics
// ============================================================================

function calculateMetrics(shipments: Shipment[]): ShipmentMetrics {
  const total = shipments.length;
  const active = shipments.filter(s => s.status !== ShipmentStatus.DELIVERED && s.status !== ShipmentStatus.CANCELLED).length;
  const inTransit = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
  const delayed = shipments.filter(s => s.status === ShipmentStatus.DELAYED).length;
  const delivered = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
  
  // Mock Analytics Data
  return {
    total,
    active,
    inTransit,
    delayed,
    delivered,
    activeTrend: 13.4,
    inTransitTrend: 18.3,
    deliveredTrend: 5.7,
    
    onTimeDeliveryRate: {
        value: 92.2,
        trend: 3.0
    },
    averageDeliveryTime: {
        value: 7.2,
        unit: 'h',
        trend: -4.5 // minutes
    },
    delayedTrend: {
        value: delayed,
        trend: -11 // minutes
    },
    dailyStats: Array.from({length: 14}, (_, i) => ({
        date: new Date(Date.now() - (13-i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        onTime: 15 + Math.floor(Math.random() * 25),
        delayed: Math.floor(Math.random() * 8),
        exception: Math.floor(Math.random() * 3),
    }))
  };
}

// ============================================================================
// MSW Handlers
// ============================================================================

export const shipmentsHandlers = [
  // GET /api/shipments/metrics - Dashboard metrics (must be before /:id)
  http.get(api('/shipments/metrics'), async () => {
    await delay(200);
    return ok(calculateMetrics(mockShipments));
  }),

  // GET /api/shipments/map-data - Optimized data for map markers (must be before /:id)
  http.get(api('/shipments/map-data'), async () => {
    await delay(300);
    
    const mapData = mockShipments.map(s => ({
      id: s.id,
      trackingNumber: s.trackingNumber,
      status: s.status,
      origin: {
        lat: s.origin.latitude,
        lng: s.origin.longitude,
        name: s.origin.displayName,
      },
      destination: {
        lat: s.destination.latitude,
        lng: s.destination.longitude,
        name: s.destination.displayName,
      },
      currentLocation: s.currentLocation
        ? {
            lat: s.currentLocation.latitude,
            lng: s.currentLocation.longitude,
          }
        : null,
      route: s.route.map(seg => ({
        path: seg.path,
        completed: seg.completed,
      })),
    }));
    
    return ok(mapData);
  }),

  // GET /api/shipments/carriers - List available carriers (must be before /:id)
  http.get(api('/shipments/carriers'), async () => {
    await delay(100);
    return ok(mockCarriers);
  }),

  // GET /api/shipments - List shipments with filters
  http.get(api('/shipments'), async ({ request }) => {
    await delay(300);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const carrier = url.searchParams.get('carrier');
    
    let filtered = mockShipments;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.trackingNumber.toLowerCase().includes(searchLower) ||
        s.destination.displayName.toLowerCase().includes(searchLower) ||
        s.origin.displayName.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(s => s.status === status);
    }
    
    // Apply carrier filter
    if (carrier && carrier !== 'all') {
      filtered = filtered.filter(s => s.carrier.code === carrier.toUpperCase());
    }
    
    return ok({
      shipments: filtered,
      total: filtered.length,
      metrics: calculateMetrics(filtered),
    });
  }),

  // GET /api/shipments/:id - Single shipment detail (MUST be last - catches everything else)
  http.get(api('/shipments/:id'), async ({ params }) => {
    await delay(200);
    const shipment = mockShipments.find(s => s.id === params.id);
    
    if (!shipment) {
      return fail('SHIPMENT_NOT_FOUND', 'Shipment not found', 404);
    }
    
    return ok(shipment);
  }),
];
