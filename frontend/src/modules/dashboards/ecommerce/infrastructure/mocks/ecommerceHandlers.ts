import { http } from 'msw';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { ok } from '@/mocks/utils/apiResponse';
import { api } from '@/mocks/utils/apiPath';
import type { ComparativeResponse, EcomKpisData, RevenueSeriesData, ChannelBreakdownData, TopProductsData, FunnelData } from '../../domain/models/EcommerceAnalytics';

function parseParams(url: URL) {
  const from = new Date(url.searchParams.get('from') || subDays(new Date(), 30));
  const to = new Date(url.searchParams.get('to') || new Date());
  return { from, to };
}

/**
 * Phase 4: Parse filter parameters from query string
 */
function parseFilters(url: URL) {
  return {
    channel: url.searchParams.get('channel') || null,
    productId: url.searchParams.get('productId') || null,
    funnelStage: url.searchParams.get('funnelStage') || null,
    country: url.searchParams.get('country') || null,
  };
}

/**
 * Phase 4: Deterministic filter multipliers
 * Same filters always produce same transformation
 * Multipliers stack multiplicatively
 */
function getFilterMultiplier(filters: ReturnType<typeof parseFilters>): number {
  let multiplier = 1.0;

  // Channel multipliers (based on typical channel distribution)
  if (filters.channel) {
    const channelMultipliers: Record<string, number> = {
      'Web': 0.45,
      'Mobile': 0.28,
      'Marketplace': 0.18,
      'POS': 0.09,
    };
    multiplier *= channelMultipliers[filters.channel] ?? 0.25;
  }

  // Product filter - single product is ~3-5% of total
  if (filters.productId) {
    multiplier *= 0.04;
  }

  // Funnel stage - progressive dropoff
  if (filters.funnelStage) {
    const funnelMultipliers: Record<string, number> = {
      'Visits': 1.0,
      'Product Views': 0.55,
      'Add to Cart': 0.15,
      'Checkout': 0.08,
      'Purchase': 0.05,
    };
    multiplier *= funnelMultipliers[filters.funnelStage] ?? 0.5;
  }

  // Country filter - based on typical geo distribution
  if (filters.country) {
    const countryMultipliers: Record<string, number> = {
      'US': 0.35,
      'GB': 0.12,
      'DE': 0.10,
      'FR': 0.08,
      'CA': 0.07,
      'AU': 0.06,
      'JP': 0.05,
      'BR': 0.04,
    };
    multiplier *= countryMultipliers[filters.country] ?? 0.05;
  }

  return multiplier;
}

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function dateSeed(from: Date, to: Date) {
  return Math.abs(
    from.getFullYear() * 10000 +
      (from.getMonth() + 1) * 100 +
      from.getDate() -
      (to.getFullYear() * 10000 + (to.getMonth() + 1) * 100 + to.getDate())
  );
}

/**
 * Calculate previous period dates
 * Previous period duration exactly matches current period duration
 */
function getPreviousPeriod(from: Date, to: Date) {
  const duration = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 24 * 60 * 60 * 1000); // Day before 'from'
  const prevFrom = new Date(prevTo.getTime() - duration);
  
  return {
    from: prevFrom,
    to: prevTo,
  };
}

// In-memory buffer for realtime orders (simulates streaming)
let realtimeOrdersBuffer: Array<{
  id: string;
  timestamp: string;
  amount: number;
  channel: string;
  country: string;
  countryCode: string;
}> = [];

let orderIdCounter = 1000;

const CHANNELS = ['Web', 'Mobile', 'Marketplace', 'POS'];
const COUNTRIES = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Japan', code: 'JP' },
  { name: 'Brazil', code: 'BR' },
];

const PRODUCT_NAMES = [
  'Premium Wireless Headphones',
  'Smart Watch Pro',
  'Ergonomic Office Chair',
  'Portable Bluetooth Speaker',
  'Ultra HD Monitor 27"',
  'Mechanical Keyboard RGB',
  'Wireless Gaming Mouse',
  'USB-C Hub Adapter',
  'Noise Cancelling Earbuds',
  'Laptop Stand Aluminum',
  'Webcam 4K HDR',
  'External SSD 1TB',
  'Smart Home Hub',
  'Fitness Tracker Band',
  'Portable Power Bank',
];

const CATEGORIES = ['Electronics', 'Audio', 'Accessories', 'Office', 'Gaming', 'Smart Home'];

// Generate a new random order
function generateRealtimeOrder(): typeof realtimeOrdersBuffer[0] {
  const rand = Math.random;
  const country = COUNTRIES[Math.floor(rand() * COUNTRIES.length)];
  return {
    id: `ORD-${++orderIdCounter}`,
    timestamp: new Date().toISOString(),
    amount: Math.floor(rand() * 500 + 20),
    channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
    country: country.name,
    countryCode: country.code,
  };
}

// Add a new order every 3-8 seconds (simulated in handler)
function maybeAddOrder() {
  if (Math.random() > 0.3) {
    const newOrder = generateRealtimeOrder();
    realtimeOrdersBuffer.unshift(newOrder);
    // Keep only last 50 orders
    if (realtimeOrdersBuffer.length > 50) {
      realtimeOrdersBuffer = realtimeOrdersBuffer.slice(0, 50);
    }
  }
}

export const ecommerceHandlers = [
  // KPIs - Always return current + previous (Filters: channel, productId, country)
  http.get(api('/analytics/ecom/kpis'), ({ request }) => {
    const url = new URL(request.url);
    const { from, to } = parseParams(url);
    const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);
    const filters = parseFilters(url);
    const multiplier = getFilterMultiplier(filters);
    
    // Generate current period data (apply filter multiplier)
    const rand = seededRandom(dateSeed(from, to));
    const revenueTotal = Math.floor((rand() * 500000 + 800000) * multiplier);
    const ordersTotal = Math.floor((rand() * 8000 + 12000) * multiplier);
    const averageOrderValue = ordersTotal > 0 ? Math.floor(revenueTotal / ordersTotal) : 0;
    const conversionRate = +(rand() * 2 + 2.5).toFixed(2);
    const refundRate = +(rand() * 1.5 + 0.5).toFixed(2);

    // Generate 30-day trends
    const days = eachDayOfInterval({ start: subDays(to, 29), end: to });
    const revenueTrend = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor((revenueTotal / 30) * (0.8 + rand() * 0.4)),
    }));
    const ordersTrend = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor((ordersTotal / 30) * (0.8 + rand() * 0.4)),
    }));
    const aovTrend = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor(averageOrderValue * (0.9 + rand() * 0.2)),
    }));
    const conversionTrend = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: +(conversionRate * (0.85 + rand() * 0.3)).toFixed(2),
    }));
    const refundTrend = days.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: +(refundRate * (0.7 + rand() * 0.6)).toFixed(2),
    }));

    const currentData: EcomKpisData = {
      revenueTotal,
      ordersTotal,
      averageOrderValue,
      conversionRate,
      refundRate,
      revenueTrend,
      ordersTrend,
      aovTrend,
      conversionTrend,
      refundTrend,
    };

    // Generate previous period data (apply same filter multiplier)
    const prevRand = seededRandom(dateSeed(prevFrom, prevTo));
    const prevRevenueTotal = Math.floor((prevRand() * 500000 + 750000) * multiplier);
    const prevOrdersTotal = Math.floor((prevRand() * 8000 + 11000) * multiplier);
    const prevAverageOrderValue = prevOrdersTotal > 0 ? Math.floor(prevRevenueTotal / prevOrdersTotal) : 0;
    const prevConversionRate = +(prevRand() * 2 + 2.3).toFixed(2);
    const prevRefundRate = +(prevRand() * 1.5 + 0.6).toFixed(2);

    const prevDays = eachDayOfInterval({ start: subDays(prevTo, 29), end: prevTo });
    const prevRevenueTrend = prevDays.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor((prevRevenueTotal / 30) * (0.8 + prevRand() * 0.4)),
    }));
    const prevOrdersTrend = prevDays.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor((prevOrdersTotal / 30) * (0.8 + prevRand() * 0.4)),
    }));
    const prevAovTrend = prevDays.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: Math.floor(prevAverageOrderValue * (0.9 + prevRand() * 0.2)),
    }));
    const prevConversionTrend = prevDays.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: +(prevConversionRate * (0.85 + prevRand() * 0.3)).toFixed(2),
    }));
    const prevRefundTrend = prevDays.map((d) => ({
      x: format(d, 'yyyy-MM-dd'),
      y: +(prevRefundRate * (0.7 + prevRand() * 0.6)).toFixed(2),
    }));

    const previousData: EcomKpisData = {
      revenueTotal: prevRevenueTotal,
      ordersTotal: prevOrdersTotal,
      averageOrderValue: prevAverageOrderValue,
      conversionRate: prevConversionRate,
      refundRate: prevRefundRate,
      revenueTrend: prevRevenueTrend,
      ordersTrend: prevOrdersTrend,
      aovTrend: prevAovTrend,
      conversionTrend: prevConversionTrend,
      refundTrend: prevRefundTrend,
    };

    const response: ComparativeResponse<EcomKpisData> = {
      period: {
        current: { from: from.toISOString(), to: to.toISOString() },
        previous: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
      },
      data: {
        current: currentData,
        previous: previousData,
      },
    };

    return ok(response);
  }),

  // Revenue Series - Filters: channel, productId
  http.get(api('/analytics/ecom/revenue-series'), ({ request }) => {
    const url = new URL(request.url);
    const { from, to } = parseParams(url);
    const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);
    const filters = parseFilters(url);
    const multiplier = getFilterMultiplier(filters);
    const rand = seededRandom(dateSeed(from, to));

    const days = eachDayOfInterval({ start: from, end: to });
    const baseRevenue = 30000 * multiplier;

    // Generate current period series
    const currentSeries = days.map((d, i) => {
      const dayOfWeek = d.getDay();
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
      const trendMultiplier = 1 + (i / days.length) * 0.15; // Slight upward trend
      const revenue = Math.floor(baseRevenue * weekendMultiplier * trendMultiplier * (0.85 + rand() * 0.3));
      const target = Math.floor(baseRevenue * 1.1);

      return {
        x: format(d, 'yyyy-MM-dd'),
        revenue,
        target,
      };
    });

    // Generate previous period series
    const prevRand = seededRandom(dateSeed(prevFrom, prevTo));
    const prevDays = eachDayOfInterval({ start: prevFrom, end: prevTo });
    const previousSeries = prevDays.map((d, i) => {
      const dayOfWeek = d.getDay();
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
      const trendMultiplier = 1 + (i / prevDays.length) * 0.12; // Slightly less growth
      const revenue = Math.floor(baseRevenue * 0.92 * weekendMultiplier * trendMultiplier * (0.85 + prevRand() * 0.3));
      const target = Math.floor(baseRevenue * 1.1);

      return {
        x: format(d, 'yyyy-MM-dd'),
        revenue,
        target,
      };
    });

    const response: ComparativeResponse<RevenueSeriesData> = {
      period: {
        current: { from: from.toISOString(), to: to.toISOString() },
        previous: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
      },
      data: {
        current: { series: currentSeries },
        previous: { series: previousSeries },
      },
    };

    return ok(response);
  }),

  // Channel Breakdown - Filters: productId only (channel breakdown shows all channels)
  http.get(api('/analytics/ecom/channels'), ({ request }) => {
    const url = new URL(request.url);
    const { from, to } = parseParams(url);
    const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);
    const filters = parseFilters(url);
    // Only apply productId filter to channel breakdown (not channel filter itself)
    const multiplier = filters.productId ? 0.04 : 1.0;
    
    // Current period
    const rand = seededRandom(dateSeed(from, to));
    const totalRevenue = Math.floor(1000000 * multiplier);
    const webShare = 0.45 + rand() * 0.1;
    const mobileShare = 0.25 + rand() * 0.08;
    const marketplaceShare = 0.18 + rand() * 0.06;
    const posShare = 1 - webShare - mobileShare - marketplaceShare;

    const currentChannels = [
      {
        channel: 'Web',
        revenue: Math.floor(totalRevenue * webShare),
        orders: Math.floor(8000 * webShare),
        percentage: +(webShare * 100).toFixed(1),
      },
      {
        channel: 'Mobile',
        revenue: Math.floor(totalRevenue * mobileShare),
        orders: Math.floor(8000 * mobileShare),
        percentage: +(mobileShare * 100).toFixed(1),
      },
      {
        channel: 'Marketplace',
        revenue: Math.floor(totalRevenue * marketplaceShare),
        orders: Math.floor(8000 * marketplaceShare),
        percentage: +(marketplaceShare * 100).toFixed(1),
      },
      {
        channel: 'POS',
        revenue: Math.floor(totalRevenue * posShare),
        orders: Math.floor(8000 * posShare),
        percentage: +(posShare * 100).toFixed(1),
      },
    ];

    // Previous period (apply same multiplier)
    const prevRand = seededRandom(dateSeed(prevFrom, prevTo));
    const prevTotalRevenue = Math.floor(920000 * multiplier);
    const prevWebShare = 0.42 + prevRand() * 0.1;
    const prevMobileShare = 0.27 + prevRand() * 0.08;
    const prevMarketplaceShare = 0.19 + prevRand() * 0.06;
    const prevPosShare = 1 - prevWebShare - prevMobileShare - prevMarketplaceShare;

    const previousChannels = [
      {
        channel: 'Web',
        revenue: Math.floor(prevTotalRevenue * prevWebShare),
        orders: Math.floor(7500 * prevWebShare),
        percentage: +(prevWebShare * 100).toFixed(1),
      },
      {
        channel: 'Mobile',
        revenue: Math.floor(prevTotalRevenue * prevMobileShare),
        orders: Math.floor(7500 * prevMobileShare),
        percentage: +(prevMobileShare * 100).toFixed(1),
      },
      {
        channel: 'Marketplace',
        revenue: Math.floor(prevTotalRevenue * prevMarketplaceShare),
        orders: Math.floor(7500 * prevMarketplaceShare),
        percentage: +(prevMarketplaceShare * 100).toFixed(1),
      },
      {
        channel: 'POS',
        revenue: Math.floor(prevTotalRevenue * prevPosShare),
        orders: Math.floor(7500 * prevPosShare),
        percentage: +(prevPosShare * 100).toFixed(1),
      },
    ];

    const response: ComparativeResponse<ChannelBreakdownData> = {
      period: {
        current: { from: from.toISOString(), to: to.toISOString() },
        previous: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
      },
      data: {
        current: { channels: currentChannels },
        previous: { channels: previousChannels },
      },
    };

    return ok(response);
  }),

  // Top Products - Filters: channel only
  http.get(api('/analytics/ecom/products'), ({ request }) => {
    const url = new URL(request.url);
    const { from, to } = parseParams(url);
    const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);
    const filters = parseFilters(url);
    // Only apply channel filter to products
    const channelMultipliers: Record<string, number> = {
      'Web': 0.45, 'Mobile': 0.28, 'Marketplace': 0.18, 'POS': 0.09
    };
    const multiplier = filters.channel ? (channelMultipliers[filters.channel] ?? 0.25) : 1.0;
    
    // Current period
    const rand = seededRandom(dateSeed(from, to));
    const currentProducts = PRODUCT_NAMES.slice(0, 15).map((name, i) => {
      const revenue = Math.floor((rand() * 80000 + 20000 - i * 3000) * multiplier);
      const orders = Math.floor((rand() * 500 + 100 - i * 20) * multiplier);
      const trend = Array.from({ length: 7 }, () => Math.floor(rand() * 100 + 20));

      return {
        id: `prod-${i + 1}`,
        name,
        category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
        imageUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/40/40`,
        revenue,
        orders,
        trend,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Previous period (apply same multiplier)
    const prevRand = seededRandom(dateSeed(prevFrom, prevTo));
    const previousProducts = PRODUCT_NAMES.slice(0, 15).map((name, i) => {
      const revenue = Math.floor((prevRand() * 75000 + 18000 - i * 2800) * multiplier);
      const orders = Math.floor((prevRand() * 480 + 90 - i * 18) * multiplier);
      const trend = Array.from({ length: 7 }, () => Math.floor(prevRand() * 100 + 20));

      return {
        id: `prod-${i + 1}`,
        name,
        category: CATEGORIES[Math.floor(prevRand() * CATEGORIES.length)],
        imageUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/40/40`,
        revenue,
        orders,
        trend,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const response: ComparativeResponse<TopProductsData> = {
      period: {
        current: { from: from.toISOString(), to: to.toISOString() },
        previous: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
      },
      data: {
        current: { products: currentProducts },
        previous: { products: previousProducts },
      },
    };

    return ok(response);
  }),

  // Funnel - Filters: channel, funnelStage
  http.get(api('/analytics/ecom/funnel'), ({ request }) => {
    const url = new URL(request.url);
    const { from, to } = parseParams(url);
    const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to);
    const filters = parseFilters(url);
    // Apply channel filter to funnel (not funnelStage - that's for other widgets)
    const channelMultipliers: Record<string, number> = {
      'Web': 0.45, 'Mobile': 0.28, 'Marketplace': 0.18, 'POS': 0.09
    };
    const multiplier = filters.channel ? (channelMultipliers[filters.channel] ?? 0.25) : 1.0;
    
    // Current period
    const rand = seededRandom(dateSeed(from, to));
    const visits = Math.floor((rand() * 50000 + 100000) * multiplier);
    const productViews = Math.floor(visits * (0.55 + rand() * 0.15));
    const addToCart = Math.floor(productViews * (0.25 + rand() * 0.1));
    const checkout = Math.floor(addToCart * (0.5 + rand() * 0.15));
    const purchase = Math.floor(checkout * (0.6 + rand() * 0.2));

    const currentSteps = [
      { step: 'Visits', value: visits, dropoff: 0 },
      { step: 'Product Views', value: productViews, dropoff: +((1 - productViews / visits) * 100).toFixed(1) },
      { step: 'Add to Cart', value: addToCart, dropoff: +((1 - addToCart / productViews) * 100).toFixed(1) },
      { step: 'Checkout', value: checkout, dropoff: +((1 - checkout / addToCart) * 100).toFixed(1) },
      { step: 'Purchase', value: purchase, dropoff: +((1 - purchase / checkout) * 100).toFixed(1) },
    ];

    // Previous period (apply same multiplier)
    const prevRand = seededRandom(dateSeed(prevFrom, prevTo));
    const prevVisits = Math.floor((prevRand() * 50000 + 95000) * multiplier);
    const prevProductViews = Math.floor(prevVisits * (0.53 + prevRand() * 0.15));
    const prevAddToCart = Math.floor(prevProductViews * (0.24 + prevRand() * 0.1));
    const prevCheckout = Math.floor(prevAddToCart * (0.48 + prevRand() * 0.15));
    const prevPurchase = Math.floor(prevCheckout * (0.58 + prevRand() * 0.2));

    const previousSteps = [
      { step: 'Visits', value: prevVisits, dropoff: 0 },
      { step: 'Product Views', value: prevProductViews, dropoff: +((1 - prevProductViews / prevVisits) * 100).toFixed(1) },
      { step: 'Add to Cart', value: prevAddToCart, dropoff: +((1 - prevAddToCart / prevProductViews) * 100).toFixed(1) },
      { step: 'Checkout', value: prevCheckout, dropoff: +((1 - prevCheckout / prevAddToCart) * 100).toFixed(1) },
      { step: 'Purchase', value: prevPurchase, dropoff: +((1 - prevPurchase / prevCheckout) * 100).toFixed(1) },
    ];

    const response: ComparativeResponse<FunnelData> = {
      period: {
        current: { from: from.toISOString(), to: to.toISOString() },
        previous: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
      },
      data: {
        current: { steps: currentSteps },
        previous: { steps: previousSteps },
      },
    };

    return ok(response);
  }),

  // Realtime Orders (polling endpoint) - Filters: channel, country
  http.get(api('/analytics/ecom/realtime/orders'), ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    
    // Simulate new orders arriving
    maybeAddOrder();

    // Initialize with some orders if empty
    if (realtimeOrdersBuffer.length === 0) {
      for (let i = 0; i < 10; i++) {
        realtimeOrdersBuffer.push(generateRealtimeOrder());
      }
    }

    // Filter orders based on active filters
    let filteredOrders = realtimeOrdersBuffer.slice(0, 20);
    if (filters.channel) {
      filteredOrders = filteredOrders.filter(o => o.channel === filters.channel);
    }
    if (filters.country) {
      filteredOrders = filteredOrders.filter(o => o.countryCode === filters.country);
    }

    return ok({
      orders: filteredOrders,
      lastUpdated: new Date().toISOString(),
    });
  }),

  // Live Visitors (REST fallback) - Phase 2: Return current snapshot only
  http.get(api('/analytics/ecom/realtime/visitors'), () => {
    // Fluctuating visitor count between 50-200
    const baseVisitors = 120;
    const fluctuation = Math.floor(Math.random() * 80 - 40);
    const count = Math.max(50, Math.min(200, baseVisitors + fluctuation));

    // Phase 2: Match LiveVisitorsMessage contract
    return ok({
      timestamp: Date.now(), // Use number timestamp, not ISO string
      count,
    });
  }),
];
