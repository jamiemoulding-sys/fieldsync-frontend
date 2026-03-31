import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';

function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

function LocationPicker({ position, setPosition }) {
  return (
    <MapContainer
      center={[52.6784, 0.9393]}
      zoom={13}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler setPosition={setPosition} />

      {position && <Marker position={position} />}
    </MapContainer>
  );
}

export default LocationPicker;