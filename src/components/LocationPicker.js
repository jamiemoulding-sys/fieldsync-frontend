import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* FIX LEAFLET DEFAULT ICONS */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* CLICK TO SET POSITION */
function LocationMarker({
  setPosition,
}) {
  useMapEvents({
    click(e) {
      setPosition(
        e.latlng
      );
    },
  });

  return null;
}

/* RECENTER WHEN POSITION CHANGES */
function Recenter({
  position,
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(
        position,
        16,
        {
          duration: 0.8,
        }
      );
    }
  }, [position, map]);

  return null;
}

export default function LocationPicker({
  position,
  setPosition,
  radius = 100,
}) {
  const defaultCenter = [
    51.505,
    -0.09,
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">

      <MapContainer
        center={
          position
            ? [
                position.lat,
                position.lng,
              ]
            : defaultCenter
        }
        zoom={13}
        scrollWheelZoom
        className="h-[320px] w-full z-0"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          setPosition={
            setPosition
          }
        />

        <Recenter
          position={
            position
          }
        />

        {position && (
          <>
            <Marker
              position={
                position
              }
            />

            <Circle
              center={
                position
              }
              radius={
                Number(
                  radius
                ) || 100
              }
              pathOptions={{
                color:
                  "#6366f1",
                fillColor:
                  "#6366f1",
                fillOpacity: 0.15,
              }}
            />
          </>
        )}

      </MapContainer>

      <div className="px-4 py-3 bg-[#020617] text-xs text-gray-400 border-t border-white/10">
        Click map to select a business location
      </div>

    </div>
  );
}