import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons missing in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to auto-zoom the map so both origin and destination fit on screen
const FitMapBounds = ({ routePath, origin, destLat, destLon }) => {
  const map = useMap();
  useEffect(() => {
    if (routePath.length > 0) {
      map.fitBounds(routePath, { padding: [50, 50] });
    } else if (origin) {
      map.fitBounds([origin, [destLat, destLon]], { padding: [50, 50] });
    }
  }, [map, routePath, origin, destLat, destLon]);
  return null;
};

const MapView = ({ lat, lon, name }) => {
  const destLat = parseFloat(lat) || 15.5529;
  const destLon = parseFloat(lon) || 73.7517;

  const [origin, setOrigin] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, time: 0 });

  // 1. Get User's Live GPS Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setOrigin([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.warn("GPS denied or failed. Defaulting origin to Pune.");
          setOrigin([18.5204, 73.8567]);
        },
        { timeout: 5000 }
      );
    } else {
      setOrigin([18.5204, 73.8567]);
    }
  }, []);

  // 2. Safely Fetch the Road Network Path (Bypasses the buggy leaflet-routing-machine!)
  useEffect(() => {
    if (!origin) return;
    
    let isMounted = true; // Prevents state updates if the component unmounts (Stops the crash!)

    const fetchRoute = async () => {
      try {
        // OSRM API requires coordinates in Longitude,Latitude order
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destLon},${destLat}?overview=full&geometries=geojson`
        );
        const data = await response.json();

        if (isMounted && data.routes && data.routes.length > 0) {
          // Convert GeoJSON [lon, lat] back to Leaflet [lat, lon]
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoutePath(coords);
          setRouteInfo({
            distance: (data.routes[0].distance / 1000).toFixed(1), // Meters to KM
            time: Math.round(data.routes[0].duration / 60) // Seconds to Mins
          });
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
      }
    };

    fetchRoute();

    return () => {
      isMounted = false; // Safe cleanup prevents memory leaks and crashes
    };
  }, [origin, destLat, destLon]);

  if (!origin) {
    return (
      <div style={{ width: '100%', height: '450px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00a8ff' }}>
        Acquiring Live GPS Signal...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
      
      {/* CUSTOM FLOATING OVERLAY */}
      <div style={styles.overlayBox}>
        <div style={styles.routeInfo}>
          <span style={styles.bestRoute}>LIVE ROAD ROUTE</span>
          <span style={styles.distanceText}>
            🚗 {routeInfo.distance > 0 ? `${routeInfo.distance} km (${routeInfo.time} mins)` : 'Calculating Route...'}
          </span>
        </div>
        <button 
          style={styles.navButton} 
          onClick={() => window.open(`https://www.google.com/maps/dir/${origin[0]},${origin[1]}/${destLat},${destLon}`, '_blank')}
        >
          Start Navigation ↗
        </button>
      </div>

      <MapContainer 
        key={`${destLat}-${destLon}`} // Refresh map cleanly
        center={origin} 
        zoom={6} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={origin}>
          <Popup>Your Current Location</Popup>
        </Marker>

        <Marker position={[destLat, destLon]}>
          <Popup>Destination: {name || "Selected Beach"}</Popup>
        </Marker>

        {/* Draw the crash-proof road path! */}
        {routePath.length > 0 && (
          <Polyline positions={routePath} color="#00a8ff" weight={5} opacity={0.8} />
        )}

        {/* Auto-zoom to fit the route */}
        <FitMapBounds routePath={routePath} origin={origin} destLat={destLat} destLon={destLon} />
        
      </MapContainer>
    </div>
  );
};

const styles = {
  overlayBox: {
    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
    backgroundColor: '#1e2738', borderRadius: '30px', padding: '10px 20px',
    display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)'
  },
  routeInfo: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  bestRoute: { color: '#a0a0a0', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' },
  distanceText: { color: '#00a8ff', fontSize: '16px', fontWeight: '800' },
  navButton: {
    backgroundColor: '#00a8ff', color: '#ffffff', border: 'none', padding: '10px 20px',
    borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.3s'
  }
};

export default MapView;