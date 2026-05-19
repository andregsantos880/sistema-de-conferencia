import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import { Icon, type LatLngExpression, type Marker as LeafletMarker } from 'leaflet';
import { getStatusMarkerColor } from '../../../shared/utils/shipmentHelpers';
import { ShipmentStatus, type Shipment } from '../../../domain/models';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// @ts-ignore
import MarkerClusterGroup from 'react-leaflet-cluster';
import { ShipmentMapSummary } from './ShipmentMapSummary';
import { ShipmentPopupContent } from './ShipmentPopupContent';

// Custom Marker visual
const createMarkerIcon = (status: ShipmentStatus, isSelected: boolean = false) => {
  const color = getStatusMarkerColor(status);
  const size = isSelected ? 48 : 32;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2.5" />
        <circle cx="12" cy="12" r="4" fill="white"/>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: isSelected ? 'leaflet-marker-selected' : '',
  });
};

interface ShipmentMapProps {
  shipments: Shipment[];
  selectedShipmentId?: string;
  onMarkerClick?: (id: string) => void;
  className?: string;
}

// Controller to handle map interactions like panning
function MapController({ selectedShipment, markerRefs }: { selectedShipment?: Shipment | undefined, markerRefs: React.MutableRefObject<{[key: string]: LeafletMarker | null}> }) {
  const map = useMap();

  useEffect(() => {
    if (selectedShipment) {
      // Zoom level 16 (Street) ensures clusters break apart due to jitter
      map.flyTo([selectedShipment.origin.latitude, selectedShipment.origin.longitude], 16, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
      
      const marker = markerRefs.current[selectedShipment.id];
      if (marker) {
        // Delay slightly longer to allow flyTo to complete/cluster to expand
        setTimeout(() => {
           marker.openPopup();
        }, 1200); 
      }
    }
  }, [selectedShipment, map, markerRefs]);

  return null;
}

export function ShipmentMap({
  shipments,
  selectedShipmentId,
  onMarkerClick,
  className = 'h-full w-full',
}: ShipmentMapProps) {
  const defaultCenter: LatLngExpression = [39.8283, -98.5795];
  const defaultZoom = 4;
  const markerRefs = useRef<{[key: string]: LeafletMarker | null}>({});
  
  const selectedShipment = shipments.find(s => s.id === selectedShipmentId);

  return (
    <div className={`relative ${className}`}>
      {/* Mobile CSS overrides for Leaflet attribution */}
      <style>{`
        @media (max-width: 768px) {
          .leaflet-control-attribution {
            bottom: auto !important;
            top: 4px !important;
            left: 4px !important;
            right: auto !important;
            font-size: 9px !important;
            padding: 2px 4px !important;
            background: rgba(255, 255, 255, 0.8) !important;
            border-radius: 4px !important;
          }
          .leaflet-control-attribution a {
            font-size: 9px !important;
          }
        }
      `}</style>
      
      {/* Floating Summary Widget */}
      <ShipmentMapSummary shipments={shipments} />
      
      {/* Blending Gradient Overlay - Heavy inset shadow matches background */}
      <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_120px_60px_hsl(var(--background))]" />
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false} // Custom placement
        className="h-full w-full bg-slate-100 dark:bg-slate-900"
      >
        <ZoomControl position="bottomright" />
        
        {/* Dark Mode Tile Layer filter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:invert dark:hue-rotate-180 dark:brightness-95 dark:contrast-[0.85]"
        />

        <MapController selectedShipment={selectedShipment} markerRefs={markerRefs} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={30} // Reduced radius for finer clustering
          disableClusteringAtZoom={8} // Explode clusters much sooner (at region level)
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          polygonOptions={{
            fillColor: '#3b82f6',
            color: '#3b82f6',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.3,
          }}
        >
          {shipments.map((shipment) => (
            <Marker
              key={shipment.id}
              position={[shipment.origin.latitude, shipment.origin.longitude]}
              icon={createMarkerIcon(shipment.status, shipment.id === selectedShipmentId)}
              eventHandlers={{
                click: () => onMarkerClick?.(shipment.id),
              }}
              ref={(ref) => { markerRefs.current[shipment.id] = ref; }}
            >
              <Popup className="shipment-popup" minWidth={340} maxWidth={380}>
                <ShipmentPopupContent shipment={shipment} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Selected Route Polyline */}
        {selectedShipment && (
          <Polyline
            positions={selectedShipment.route.flatMap(s => s.path) as LatLngExpression[]}
            color={getStatusMarkerColor(selectedShipment.status)}
            weight={4}
            opacity={0.8}
            dashArray={selectedShipment.status === ShipmentStatus.DELAYED ? '5, 10' : undefined}
          />
        )}
      </MapContainer>
    </div>
  );
}
