import { ws } from 'msw';

/**
 * WebSocket link for E-commerce realtime data
 * Endpoint: ws://[host]/ws/ecom/realtime (or wss:// in production)
 * 
 * Note: Using a regex pattern to match any host and port since MSW needs to
 * intercept WebSocket connections regardless of the deployment environment.
 * This pattern matches both localhost (development) and production domains.
 */
export const ecomRealtimeLink = ws.link(/^wss?:\/\/[^/]+\/ws\/ecom\/realtime$/);

// In-memory state for realtime simulation
// Use timestamp-based IDs to ensure uniqueness across HMR reloads
let orderIdCounter = Date.now();
let visitorCount = 120;

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

function generateOrder() {
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  return {
    id: `ORD-${++orderIdCounter}`,
    timestamp: new Date().toISOString(),
    amount: Math.floor(Math.random() * 500 + 20),
    channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
    country: country.name,
    countryCode: country.code,
  };
}

/**
 * Update visitor count with small realistic deltas
 * Phase 2: Change by small deltas (-3 to +5)
 */
function updateVisitorCount() {
  const delta = Math.floor(Math.random() * 9 - 3); // Range: -3 to +5
  visitorCount = Math.max(0, visitorCount + delta); // Never go below zero
  return visitorCount;
}

/**
 * WebSocket handler for E-commerce realtime data
 * 
 * Phase 2 Message Contract:
 * Live Visitors messages follow the LiveVisitorsMessage shape:
 * {
 *   type: 'LIVE_VISITORS_UPDATE',
 *   payload: {
 *     timestamp: number,  // Date.now()
 *     count: number       // Current visitor count
 *   }
 * }
 * 
 * Legacy message types (still supported):
 * - { type: 'order', data: RealtimeOrder }
 * - { type: 'visitors', data: { count: number, timestamp: string } } // Deprecated
 * - { type: 'connected', data: { message: string } }
 * 
 * Message types received from client:
 * - { type: 'subscribe', channels: string[] }
 * - { type: 'unsubscribe', channels: string[] }
 */
export const ecommerceWebSocketHandler = ecomRealtimeLink.addEventListener(
  'connection',
  ({ client }) => {
    console.log('[MSW WS] E-commerce realtime client connected');

    // Track subscriptions for this client
    const subscriptions = new Set<string>(['orders', 'visitors']);
    
    // Track connection state to stop recursive timeouts
    let isConnected = true;

    // Send initial connection confirmation
    client.send(
      JSON.stringify({
        type: 'connected',
        data: { message: 'Connected to E-commerce realtime stream' },
      })
    );

    // Send initial visitor count using new Phase 2 contract
    client.send(
      JSON.stringify({
        type: 'LIVE_VISITORS_UPDATE',
        data: {
          timestamp: Date.now(),
          count: visitorCount,
        },
      })
    );

    // Simulate new orders arriving every 5-10 seconds
    const orderInterval = setInterval(() => {
      if (subscriptions.has('orders') && Math.random() > 0.3) {
        const order = generateOrder();
        client.send(
          JSON.stringify({
            type: 'order',
            data: order,
          })
        );
      }
    }, 5000 + Math.random() * 5000);

    /**
     * Phase 2: Live Visitors stream
     * - Emit every 800-1400ms (randomized with jitter)
     * - Messages represent current moment only
     * - No batching, no historical payloads
     */
    function scheduleNextVisitorUpdate() {
      // Stop scheduling if client disconnected
      if (!isConnected) return;
      
      // Randomized interval: 800-1400ms with jitter
      const baseInterval = 800 + Math.random() * 600; // 800-1400ms
      const jitter = (Math.random() - 0.5) * 100; // ±50ms jitter
      const interval = Math.max(800, baseInterval + jitter);

      setTimeout(() => {
        // Double-check connection state before sending
        if (!isConnected) return;
        
        if (subscriptions.has('visitors')) {
          const count = updateVisitorCount();
          
          // Send using Phase 2 contract
          client.send(
            JSON.stringify({
              type: 'LIVE_VISITORS_UPDATE',
              data: {
                timestamp: Date.now(),
                count,
              },
            })
          );
        }
        
        // Schedule next update only if still connected
        if (isConnected) {
          scheduleNextVisitorUpdate();
        }
      }, interval);
    }

    // Start the visitor update stream
    scheduleNextVisitorUpdate();

    // Handle incoming messages from client
    client.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data as string) as {
          type: string;
          channels?: string[];
        };

        if (message.type === 'subscribe' && message.channels) {
          message.channels.forEach((ch) => subscriptions.add(ch));
          console.log('[MSW WS] Subscribed to:', message.channels);
        }

        if (message.type === 'unsubscribe' && message.channels) {
          message.channels.forEach((ch) => subscriptions.delete(ch));
          console.log('[MSW WS] Unsubscribed from:', message.channels);
        }
      } catch (e) {
        console.error('[MSW WS] Failed to parse message:', e);
      }
    });

    // Cleanup on close
    client.addEventListener('close', () => {
      console.log('[MSW WS] E-commerce realtime client disconnected');
      isConnected = false; // Stop recursive visitor updates
      clearInterval(orderInterval);
    });
  }
);

export const ecommerceWebSocketHandlers = [ecommerceWebSocketHandler];
