import { ShipmentStatus } from '../../domain/models';

/**
 * Get status badge configuration
 */
export function getStatusConfig(status: ShipmentStatus) {
  const configs = {
    pending: {
      label: 'Pending',
      variant: 'default' as const,
      color: 'text-muted-foreground bg-muted',
    },
    picked_up: {
      label: 'Picked Up',
      variant: 'default' as const,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    },
    in_transit: {
      label: 'In Transit',
      variant: 'default' as const,
      color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      variant: 'default' as const,
      color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
    },
    delivered: {
      label: 'Delivered',
      variant: 'success' as const,
      color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    },
    delayed: {
      label: 'Delayed',
      variant: 'destructive' as const,
      color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    },
    exception: {
      label: 'Exception',
      variant: 'destructive' as const,
      color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950',
    },
    cancelled: {
      label: 'Cancelled',
      variant: 'default' as const,
      color: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950',
    },
    returned: {
      label: 'Returned',
      variant: 'warning' as const,
      color: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    },
  };

  return configs[status];
}

/**
 * Get status marker color for map
 */
export function getStatusMarkerColor(status: ShipmentStatus): string {
  const colors = {
    pending: '#9ca3af', // gray
    picked_up: '#3b82f6', // blue
    in_transit: '#3b82f6', // blue
    out_for_delivery: '#a855f7', // purple
    delivered: '#22c55e', // green
    delayed: '#ef4444', // red
    exception: '#f97316', // orange
    cancelled: '#6b7280', // gray
    returned: '#eab308', // yellow
  };

  return colors[status];
}

/**
 * Format ETA (estimated time of arrival)
 */
export function formatETA(estimatedDelivery: string): string {
  const now = new Date();
  const eta = new Date(estimatedDelivery);
  const diffMs = eta.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffMs < 0) {
    // Past ETA
    const absDiffHours = Math.abs(diffHours);
    if (absDiffHours < 24) {
      return `${absDiffHours}h late`;
    }
    const days = Math.floor(absDiffHours / 24);
    return `${days}d late`;
  }

  // Future ETA
  if (diffHours < 1) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  const days = Math.floor(diffHours / 24);
  return `${days}d`;
}

/**
 * Format duration from now
 */
export function formatDuration(targetDate: string): string {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    return 'Overdue';
  }

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${diffMinutes} minutes`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  }

  const days = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  
  if (remainingHours === 0) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }
  
  return `${days}d ${remainingHours}h`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  
  return past.toLocaleDateString();
}

/**
 * Get status color (alias for marker color)
 */
export const getStatusColor = getStatusMarkerColor;
