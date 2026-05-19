/**
 * E-commerce Realtime Data Hooks
 * 
 * Unified hooks that switch between polling and WebSocket based on global configuration.
 * Uses the shared realtime infrastructure from @/shared/infrastructure/realtime.
 * 
 * These hooks demonstrate the "primitives" pattern:
 * - Shared infrastructure provides connection/subscription primitives
 * - Domain-specific logic (buffers, trend calculation) lives here
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  useRealtimeMode, 
  useRealtimeChannel,
} from '@/shared/infrastructure/realtime';
import { useRealtimeOrdersWithQuery, useLiveVisitorsWithQuery } from './useEcommerceAnalytics';
import type { RealtimeOrder, LiveVisitorsMessage } from '../../domain/models/EcommerceAnalytics';

// E-commerce WebSocket endpoint path
const ECOM_WS_PATH = '/ws/ecom/realtime';

// ============================================================================
// Realtime Orders Hook - Uses shared primitives + domain-specific logic
// ============================================================================

interface UseRealtimeOrdersOptions {
  /** Maximum number of orders to keep in the list (default: 20) */
  maxOrders?: number;
  /** Polling interval when in polling mode (default: 5 seconds) */
  pollInterval?: number;
}

/**
 * Realtime Orders Hook for E-commerce Dashboard
 * 
 * Demonstrates the "primitives" pattern:
 * - Uses shared `useRealtimeChannel` for WebSocket subscription
 * - Uses shared `useRealtimeMode` for mode switching
 * - Domain-specific logic (order list management, highlighting) stays here
 * 
 * @example
 * ```tsx
 * const { orders, newOrderIds, isConnected } = useRealtimeOrders();
 * ```
 */
export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const { maxOrders = 20, pollInterval = 5000 } = options;
  const { mode } = useRealtimeMode();
  
  // ─────────────────────────────────────────────────────────────────────────
  // State: Order list with pause support
  // ─────────────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // ─────────────────────────────────────────────────────────────────────────
  // WebSocket: Use shared primitive
  // ─────────────────────────────────────────────────────────────────────────
  const { 
    isConnected, 
    lastMessage 
  } = useRealtimeChannel<RealtimeOrder>({
    path: ECOM_WS_PATH,
    channel: 'order',
  });

  // Process WebSocket messages into orders list
  useEffect(() => {
    if (mode !== 'websocket' || !lastMessage?.data || isPausedRef.current) return;
    
    const newOrder = lastMessage.data;
    const orderId = newOrder.id;

    setOrders((prev) => {
      // Check if order already exists to prevent duplicates
      const exists = prev.some((order) => order.id === orderId);
      if (exists) return prev;
      
      return [newOrder, ...prev].slice(0, maxOrders);
    });

    // Highlight new order
    setNewOrderIds(new Set([orderId]));
    
    // Clear highlight after animation
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = setTimeout(() => setNewOrderIds(new Set()), 2000);
    
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [mode, lastMessage, maxOrders]);

  // ─────────────────────────────────────────────────────────────────────────
  // Polling: Fallback when WebSocket is not available
  // ─────────────────────────────────────────────────────────────────────────
  const pollingResult = useRealtimeOrdersWithQuery({
    maxOrders,
    pollInterval,
    enabled: mode === 'polling' && !isPaused,
  });

  // Sync polling results to orders state
  useEffect(() => {
    if (mode !== 'polling' || isPausedRef.current) return;
    setOrders(pollingResult.orders);
    setNewOrderIds(pollingResult.newOrderIds);
  }, [mode, pollingResult.orders, pollingResult.newOrderIds]);

  // ─────────────────────────────────────────────────────────────────────────
  // Controls
  // ─────────────────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => setIsPaused(prev => !prev), []);
  
  const refetch = useCallback(() => {
    if (mode === 'polling') {
      pollingResult.refetch();
    }
    // WebSocket reconnection is handled by the shared infrastructure
  }, [mode, pollingResult]);

  return {
    // Data
    orders,
    newOrderIds,
    
    // Controls
    isPaused,
    togglePause,
    refetch,
    
    // Connection state
    mode,
    isConnected: mode === 'websocket' ? isConnected : true,
    isLoading: mode === 'polling' ? pollingResult.isLoading : false,
    isFetching: mode === 'polling' ? pollingResult.isFetching : false,
  };
}


/**
 * Live Visitors Data Point for rolling buffer (E-commerce specific)
 */
export interface LiveVisitorPoint {
  t: number; // timestamp
  value: number; // visitor count
}

/**
 * Calculate trend based on linear regression slope over recent points
 * This is a domain-specific utility for the E-commerce dashboard
 */
function calculateTrend(points: LiveVisitorPoint[], windowPoints = 10): 'increasing' | 'stable' | 'decreasing' {
  if (points.length < 3) return 'stable';
  
  const recentPoints = points.slice(-Math.min(windowPoints, points.length));
  const n = recentPoints.length;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  recentPoints.forEach((point, index) => {
    sumX += index;
    sumY += point.value;
    sumXY += index * point.value;
    sumXX += index * index;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const threshold = 0.05;
  
  if (slope > threshold) return 'increasing';
  if (slope < -threshold) return 'decreasing';
  return 'stable';
}

// ============================================================================
// Live Visitors Hook - Uses shared primitives + domain-specific logic
// ============================================================================

interface UseLiveVisitorsOptions {
  /** Rolling window duration in ms (default: 60 seconds) */
  windowMs?: number;
  /** Polling interval when in polling mode (default: 2 seconds) */
  pollInterval?: number;
}

/**
 * Live Visitors Hook for E-commerce Dashboard
 * 
 * Demonstrates the "primitives" pattern:
 * - Uses shared `useRealtimeChannel` for WebSocket subscription
 * - Uses shared `useRealtimeMode` for mode switching
 * - Domain-specific logic (rolling buffer, trend calculation) stays here
 * 
 * @example
 * ```tsx
 * const { count, chartData, trend, isConnected } = useLiveVisitors();
 * ```
 */
export function useLiveVisitors(options: UseLiveVisitorsOptions = {}) {
  const { windowMs = 60000, pollInterval = 2000 } = options;
  const { mode } = useRealtimeMode();
  
  // ─────────────────────────────────────────────────────────────────────────
  // State: Rolling buffer for chart data
  // ─────────────────────────────────────────────────────────────────────────
  const [buffer, setBuffer] = useState<LiveVisitorPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // ─────────────────────────────────────────────────────────────────────────
  // WebSocket: Use shared primitive
  // ─────────────────────────────────────────────────────────────────────────
  const { 
    isConnected, 
    lastMessage 
  } = useRealtimeChannel<LiveVisitorsMessage>({
    path: ECOM_WS_PATH,
    channel: 'LIVE_VISITORS_UPDATE',
  });

  // Process WebSocket messages into buffer
  useEffect(() => {
    if (mode !== 'websocket' || !lastMessage?.data || isPausedRef.current) return;
    
    const payload = lastMessage.data;
    const now = Date.now();
    
    setBuffer((prev) => {
      const point: LiveVisitorPoint = { t: payload.timestamp, value: payload.count };
      return [...prev, point].filter(p => now - p.t < windowMs);
    });
  }, [mode, lastMessage, windowMs]);

  // ─────────────────────────────────────────────────────────────────────────
  // Polling: Fallback when WebSocket is not available
  // ─────────────────────────────────────────────────────────────────────────
  const pollingResult = useLiveVisitorsWithQuery({
    pollInterval,
    enabled: mode === 'polling' && !isPaused,
  });

  // Process polling results into buffer
  useEffect(() => {
    if (mode !== 'polling' || !pollingResult.count || isPausedRef.current) return;
    
    const now = Date.now();
    setBuffer((prev) => {
      const point: LiveVisitorPoint = { t: now, value: pollingResult.count! };
      return [...prev, point].filter(p => now - p.t < windowMs);
    });
  }, [mode, pollingResult.count, windowMs]);

  // ─────────────────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────────────────
  const currentCount = buffer.length > 0 ? buffer[buffer.length - 1].value : null;
  const previousCount = buffer.length > 1 ? buffer[buffer.length - 2].value : null;
  const trend = calculateTrend(buffer);

  // ─────────────────────────────────────────────────────────────────────────
  // Controls
  // ─────────────────────────────────────────────────────────────────────────
  const togglePause = useCallback(() => setIsPaused(prev => !prev), []);
  
  const refetch = useCallback(() => {
    if (mode === 'polling') {
      pollingResult.refetch();
    }
    // WebSocket reconnection is handled by the shared infrastructure
  }, [mode, pollingResult]);

  return {
    // Data
    count: currentCount,
    previousCount,
    chartData: buffer,
    trend,
    
    // Controls
    isPaused,
    togglePause,
    refetch,
    
    // Connection state
    mode,
    isConnected: mode === 'websocket' ? isConnected : true,
    isLoading: mode === 'polling' ? pollingResult.isLoading : false,
    isFetching: mode === 'polling' ? pollingResult.isFetching : false,
  };
}
