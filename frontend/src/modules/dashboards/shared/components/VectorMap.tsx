/* Imports from amCharts */
import { useLayoutEffect, useRef, useEffect, useMemo } from 'react';
import { color, Root, Tooltip } from "@amcharts/amcharts5";
import { MapChart, MapPolygonSeries, MapPointSeries, geoMercator } from "@amcharts/amcharts5/map";
import * as am5 from "@amcharts/amcharts5";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { cn } from '@/shadcn/lib/utils';

export interface VectorMapMarker {
  id: string; // Should be ISO 2 country code (e.g., 'US')
  name: string;
  lat: number;
  lng: number;
  value?: number;
  meta?: Record<string, unknown>;
}

export interface VectorMapProps {
  map: string; // Ignored in this implementation, always uses worldLow
  markers: VectorMapMarker[];
  className?: string;
  
  /** Currently selected marker ID for highlighting */
  selectedMarkerId?: string | null;
  
  /** Callback when a marker is hovered */
  onMarkerHover?: (id: string | null) => void;
  
  /** Callback when a marker is clicked */
  onMarkerClick?: (id: string) => void;
  
  /** Custom tooltip HTML generator */
  getTooltipHtml?: (marker: VectorMapMarker) => string;
}

export function VectorMap({
  markers,
  className,
  selectedMarkerId,
  onMarkerClick,
  getTooltipHtml,
}: VectorMapProps) {
  const chartRef = useRef<MapChart | null>(null);
  const polygonSeriesRef = useRef<MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<MapPointSeries | null>(null);
  const rootRef = useRef<Root | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate scaling for bubbles
  const maxRevenue = useMemo(() => {
    return Math.max(...markers.map(m => m.value || 0), 1);
  }, [markers]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Create Root element
    const root = Root.new(containerRef.current); 
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create Map Chart
    const chart = root.container.children.push(
      MapChart.new(root, {
        panX: "rotateX",
        panY: "translateY",
        projection: geoMercator(),
        homeZoomLevel: 1,
      })
    );
    chartRef.current = chart;

    // ──────────────────────────────────────────────────────────────────────
    // 1. Base Map (Polygons)
    // ──────────────────────────────────────────────────────────────────────
    const polygonSeries = chart.series.push(
      MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"], // Exclude Antarctica
      })
    );
    polygonSeriesRef.current = polygonSeries;

    // Configure Polygons (Neutral background, highlight on hover)
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      fill: color(0xe2e8f0), // slate-200 (neutral gray)
      stroke: color(0xffffff),
      strokeWidth: 1,
      templateField: "polygonSettings",
    });

    // States: Hover (Fill country on hover)
    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: color(0x93c5fd), // blue-300 (highlight)
      fillOpacity: 1,
    });

    // States: Active (Selected country)
    polygonSeries.mapPolygons.template.states.create("active", {
      fill: color(0x93c5fd), // blue-300 (same as hover)
      fillOpacity: 1,
    });
    
    // Add Click listener to Polygons
    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem) {
        // Safe cast to access id from dataContext (geoJSON id)
        const id = (dataItem.dataContext as any)?.id; // e.g. "US"
        if (onMarkerClick && id) {
          onMarkerClick(id);
        }
      }
    });

    // ──────────────────────────────────────────────────────────────────────
    // 2. Bubbles (Point Series)
    // ──────────────────────────────────────────────────────────────────────
    const pointSeries = chart.series.push(
      MapPointSeries.new(root, {
        latitudeField: "latitude",
        longitudeField: "longitude",
      })
    );
    pointSeriesRef.current = pointSeries;

    // Bubble Template
    pointSeries.bullets.push(() => {
      const circle = am5.Circle.new(root, {
        radius: 4, // base radius, will be adapted
        fill: color(0x3b82f6), // blue-500 (bubble color)
        fillOpacity: 0.7,
        stroke: color(0xffffff),
        strokeWidth: 1,
        tooltipText: "{name}", // Tooltip on bubble too
      });
      
      // Dynamic Radius Adapter based on 'value'
      circle.adapters.add("radius", (radius, target) => {
        const dataItem = target.dataItem;
        if (dataItem) {
           const context = dataItem.dataContext as any;
           if (context && typeof context.value === 'number' && typeof context.maxVal === 'number') {
              const max = context.maxVal || 1;
              const val = context.value;
              // Scale: Min 4px, Max 20px
              return 4 + (val / max) * 16;
           }
        }
        return radius;
      });

      return am5.Bullet.new(root, {
        sprite: circle
      });
    });

    // ──────────────────────────────────────────────────────────────────────
    // 3. Tooltip Styling
    // ──────────────────────────────────────────────────────────────────────
    const tooltip = Tooltip.new(root, {
      getFillFromSprite: false,
      autoTextColor: false,
    });
    
    // Custom Background
    tooltip.get("background")?.setAll({
      fill: color(0x0f172a), // slate-900 (Dark Accent)
      fillOpacity: 0.95,
      stroke: color(0x3b82f6), // blue-500 border
      strokeWidth: 1,
      // cornerRadius handled by theme or specific graphics type
    });
    
    // Custom Text
    tooltip.label.setAll({
      fill: color(0xffffff), // White text
      fontSize: 12,
    });

    // Assign tooltip to series
    polygonSeries.set("tooltip", tooltip);
    pointSeries.set("tooltip", tooltip); // Bubbles share same tooltip style

    // Tooltip Adapter (HTML Content)
    if (getTooltipHtml) {
      tooltip.adapters.add("html", (text, target) => {
         const dataItem = target.dataItem; // Tooltip's data item
         if (dataItem) {
             const context = dataItem.dataContext as any;
             // Context usually has our marker data if bound correctly
             if (context && context.id) {
                // Ensure we construct a marker object compatible with getTooltipHtml
                // For polygon, context merges geoJSON + our data
                return getTooltipHtml(context as VectorMapMarker);
             }
         }
         return text || "";
      });
      // Disable default text if HTML is provided
      // tooltip.label.set("text", ""); 
    }

    // Set Data for Polygons (to link IDs)
    // We bind data to polygons so they can be identified
    const polygonData = markers.map(m => ({
      ...m
    }));
    polygonSeries.data.setAll(polygonData);

    // Set Data for Points (Bubbles)
    // Needs latitude/longitude properties
    const pointData = markers.map(m => ({
       ...m,
       latitude: m.lat,
       longitude: m.lng,
       value: m.value,
       maxVal: maxRevenue, // Pass max revenue for scaling in adapter
    }));
    pointSeries.data.setAll(pointData);

    // cleanup
    return () => {
      root.dispose();
    };
  }, []); // Re-mount logic handles updates via refs if needed, but here we separate updates

  // Effect to update data when markers change
  useEffect(() => {
    if (polygonSeriesRef.current && pointSeriesRef.current) {
        const polygonData = markers.map(m => ({
            ...m
        }));
        polygonSeriesRef.current.data.setAll(polygonData);

        const pointData = markers.map(m => ({
            ...m,
            latitude: m.lat,
            longitude: m.lng,
            value: m.value,
            maxVal: maxRevenue,
        }));
        pointSeriesRef.current.data.setAll(pointData);
    }
  }, [markers, maxRevenue]);

  // Effect for Selection / Zoom (Issue #1 Fix)
  useEffect(() => {
    const chart = chartRef.current;
    const series = polygonSeriesRef.current;
    
    if (chart && series) {
      // De-select previous
      series.mapPolygons.each((polygon) => {
          polygon.states.applyAnimate("default");
      });

      if (selectedMarkerId) {
        const dataItem = series.getDataItemById(selectedMarkerId);
        if (dataItem) {
          const polygon = dataItem.get("mapPolygon");
          if (polygon) {
             polygon.show(); // Ensure visible
             polygon.states.applyAnimate("active");
             
             // Zoom using coordinates from marker data
             const marker = markers.find(m => m.id === selectedMarkerId);
             if (marker) {
               chart.zoomToGeoPoint(
                 { latitude: marker.lat, longitude: marker.lng },
                 4, // zoom level
                 true // center
               );
             }
          }
        }
      } else {
        chart.goHome();
      }
    }
  }, [selectedMarkerId]);

  return (
    <div ref={containerRef} className={cn('h-full w-full overflow-hidden', className)} />
  );
}
