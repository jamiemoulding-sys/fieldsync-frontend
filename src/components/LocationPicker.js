/* =========================================================
src/components/LocationPicker.js
FULL FILE
========================================================= */

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
} from "react-leaflet";

import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Recenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(
        [position.lat, position.lng],
        17,
        { duration: 1 }
      );
    }
  }, [position, map]);

  return null;
}

export default function LocationPicker({
  position,
  setPosition,
  radius = 100,
  onSelectAddress,
}) {
  const [postcode, setPostcode] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const searchPostcode =
    async () => {
      if (!postcode) return;

      try {
        setLoading(true);

        const res =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=gb&q=${encodeURIComponent(
              postcode
            )}`
          );

        const data =
          await res.json();

        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

  const chooseResult = (
    item
  ) => {
    const pos = {
      lat: Number(item.lat),
      lng: Number(item.lon),
    };

    setPosition(pos);

    if (onSelectAddress) {
      onSelectAddress(
        item.display_name
      );
    }
  };

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-4 gap-2">
        <input
          value={postcode}
          onChange={(e) =>
            setPostcode(
              e.target.value
            )
          }
          placeholder="Postcode"
          className="col-span-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
        />

        <button
          type="button"
          onClick={
            searchPostcode
          }
          className="bg-indigo-600 rounded-xl"
        >
          Search
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-400">
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/5">
          {results.map(
            (item, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  chooseResult(
                    item
                  )
                }
                className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm"
              >
                {
                  item.display_name
                }
              </button>
            )
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10">

        <MapContainer
          center={
            position
              ? [
                  position.lat,
                  position.lng,
                ]
              : [
                  51.8787,
                  0.5529,
                ]
          }
          zoom={13}
          className="h-[320px] w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {position && (
            <>
              <Marker
                position={[
                  position.lat,
                  position.lng,
                ]}
              />

              <Circle
                center={[
                  position.lat,
                  position.lng,
                ]}
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

          <Recenter
            position={
              position
            }
          />
        </MapContainer>

      </div>

    </div>
  );
}