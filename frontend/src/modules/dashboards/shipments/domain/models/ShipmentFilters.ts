import type { ShipmentStatus, ShipmentPriority, ServiceType } from './Shipment';

/**
 * Shipment filter state
 */
export interface ShipmentFilters {
  // Search
  search: string;
  
  // Status
  statuses: ShipmentStatus[];
  
  // Carriers
  carriers: string[];
  
  // Date Range
  dateRange: {
    from: string | null;
    to: string | null;
    preset: DatePreset | null;
  };
  
  // Priority
  priorities: ShipmentPriority[];
  
  // Service Type
  serviceTypes: ServiceType[];
  
  // Route filters
  originFilter: string;
  destinationFilter: string;
  
  // Created date range
  createdDateRange: {
    from: string | null;
    to: string | null;
  };
  
  // Quick toggles
  showDelayedOnly: boolean;
  showMyShipments: boolean;
}

/**
 * Date range presets
 */
export type DatePreset = 'today' | 'week' | 'month' | 'custom';

/**
 * Initial/default filter state
 */
export const defaultFilters: ShipmentFilters = {
  search: '',
  statuses: [],
  carriers: [],
  dateRange: {
    from: null,
    to: null,
    preset: null
  },
  priorities: [],
  serviceTypes: [],
  originFilter: '',
  destinationFilter: '',
  createdDateRange: {
    from: null,
    to: null
  },
  showDelayedOnly: false,
  showMyShipments: false
};
