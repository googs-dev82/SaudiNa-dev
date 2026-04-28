"use client";

import "leaflet/dist/leaflet.css";

import { divIcon, type LatLngLiteral } from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";

const markerIcon = divIcon({
  className: "",
  html: '<span style="display:flex;height:20px;width:20px;align-items:center;justify-content:center;border-radius:9999px;background:#315c3f;border:3px solid white;box-shadow:0 10px 24px rgba(49,92,63,.24)"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ClickToSetMarker({
  value,
  onChange,
}: {
  value: LatLngLiteral | null;
  onChange: (nextValue: LatLngLiteral) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  if (!value) {
    return null;
  }

  return <Marker icon={markerIcon} position={value} />;
}

export function RecoveryLocationPickerMap({
  value,
  onChange,
}: {
  value: LatLngLiteral | null;
  onChange: (nextValue: LatLngLiteral) => void;
}) {
  const center = value ?? { lat: 24.7136, lng: 46.6753 };

  return (
    <div className="overflow-hidden rounded-lg border border-secondary/15 bg-white shadow-sm">
      <MapContainer
        center={center}
        zoom={value ? 13 : 6}
        scrollWheelZoom
        className="h-72 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToSetMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
