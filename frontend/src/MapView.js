import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to auto-zoom map so both User & Beach fit on screen
function MapBoundsFitter({ userLocation, beachLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && beachLocation) {
      const bounds = L.latLngBounds([userLocation, beachLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, beachLocation, map]);

  return null;
}

export default function MapView({ 
  beachLat = 15.5553, 
  beachLng = 73.7517, 
  beachName = "Baga Beach" 
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const beachLocation = [beachLat, beachLng];

  useEffect(() => {
    // 1. Get Live User GPS Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const userPos = [userLat, userLng];
          setUserLocation(userPos);

          // 2. Fetch Driving Route from OSRM Routing Engine
          fetch(
            `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${beachLng},${beachLat}?overview=full&geometries=geojson`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
                
                setRouteCoords(coords);
                setDistance((route.distance / 1000).toFixed(1)); // KM
                setDuration(Math.round(route.duration / 60));   // Minutes
              }
            })
            .catch((err) => console.error("Routing error:", err));
        },
        (err) => console.warn("Location permission denied", err)
      );
    }
  }, [beachLat, beachLng]);

  // Turn-by-turn navigation redirect
  const openGoogleMaps = () => {
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${beachLat},${beachLng}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${beachLat},${beachLng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.mapWrapper}>
      {/* Route Header Info Card */}
      {distance && duration && (
        <div style={styles.infoBanner}>
          <div>
            <span style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', letterSpacing: '0.5px' }}>BEST ROUTE</span>
            <strong style={{ fontSize: '15px', color: '#38bdf8' }}>🚗 {distance} km ({duration} mins)</strong>
          </div>
          <button onClick={openGoogleMaps} style={styles.navButton}>
            Start Navigation ↗
          </button>
        </div>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={beachLocation}
        zoom={13}
        style={{ height: '420px', width: '100%', borderRadius: '20px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Beach Location Pin */}
        <Marker position={beachLocation}>
          <Popup>
            <strong>🏖️ {beachName}</strong>
          </Popup>
        </Marker>

        {/* Live User Location Pin & Polyline Route */}
        {userLocation && (
          <>
            <Marker position={userLocation}>
              <Popup>
                <strong>📍 Your Location</strong>
              </Popup>
            </Marker>

            {/* Neon Blue Route Polyline */}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                color="#00a8ff"
                weight={6}
                opacity={0.8}
              />
            )}

            {/* Auto fit bounds */}
            <MapBoundsFitter userLocation={userLocation} beachLocation={beachLocation} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

const styles = {
  mapWrapper: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '20px'
  },
  infoBanner: {
    position: 'absolute',
    top: '15px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    padding: '8px 18px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  navButton: {
    backgroundColor: '#00a8ff',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
};