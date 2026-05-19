import { useQuery } from '@tanstack/react-query';
import type { Shipment, ShipmentMetrics, ShipmentStatus } from '../../domain/models';

interface ShipmentsQueryParams {
  search?: string;
  status?: string;
  carrier?: string;
  from?: string;
  to?: string;
}

interface ShipmentsResponse {
  shipments: Shipment[];
  total: number;
  metrics: ShipmentMetrics;
}

/**
 * Hook to fetch shipments list with filters
 */
export function useShipmentsQuery(params: ShipmentsQueryParams = {}) {
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.search) searchParams.append('search', params.search);
      if (params.status) searchParams.append('status', params.status);
      if (params.carrier) searchParams.append('carrier', params.carrier);
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      
      const response = await fetch(`/api/shipments?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipments');
      }
      
      const result = await response.json();
      return result.data as ShipmentsResponse;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time feel
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to fetch dashboard metrics
 */
export function useShipmentMetrics() {
  return useQuery({
    queryKey: ['shipments', 'metrics'],
    queryFn: async () => {
      const response = await fetch('/api/shipments/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipment metrics');
      }
      
      const result = await response.json();
      return result.data as ShipmentMetrics;
    },
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to fetch single shipment detail
 */
export function useShipmentDetail(id: string | null) {
  return useQuery({
    queryKey: ['shipments', id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/shipments/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch shipment');
      }
      
      const result = await response.json();
      return result.data as Shipment;
    },
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch optimized map data
 */
export function useMapData() {
  return useQuery({
    queryKey: ['shipments', 'map-data'],
    queryFn: async () => {
      const response = await fetch('/api/shipments/map-data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch map data');
      }
      
      const result = await response.json();
      return result.data as Array<{
        id: string;
        trackingNumber: string;
        status: ShipmentStatus;
        origin: { lat: number; lng: number; name: string };
        destination: { lat: number; lng: number; name: string };
        currentLocation: { lat: number; lng: number } | null;
        route: Array<{ path: [number, number][]; completed: boolean }>;
      }>;
    },
    staleTime: 30000,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to fetch available carriers
 */
export function useCarriers() {
  return useQuery({
    queryKey: ['shipments', 'carriers'],
    queryFn: async () => {
      const response = await fetch('/api/shipments/carriers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch carriers');
      }
      
      const result = await response.json();
      return result.data as Array<{
        id: string;
        name: string;
        code: string;
        logo: string;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (carriers don't change often)
  });
}
