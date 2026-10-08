import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ lat, lon, name }) => {
  // Fallback to default coordinates if none are provided
  const latitude = lat ? parseFloat(lat) : 15.4989;
  const longitude = lon ? parseFloat(lon) : 73.8278;
  const beachName = name || "Selected Beach";

  return (
    <div style={{ width: '100%', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer 
        key={`${latitude}-${longitude}`} // Forces re-render when beach changes!
        center={[latitude, longitude]} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <strong>{beachName}</strong> <br /> Lat: {latitude}, Lon: {longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;