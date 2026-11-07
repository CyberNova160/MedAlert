"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Place = { name: string; type: string; lat: number; lon: number; address?: string };
const pin = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34]
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center, map]);
  return null;
}

export default function MapPanel({ places }: { places: Place[] }) {
  const [center, setCenter] = useState<[number,number]>([30.356, 76.364]);
  const [status, setStatus] = useState("Showing the campus area");
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      p => { setCenter([p.coords.latitude, p.coords.longitude]); setStatus("Centered on your current location"); },
      () => setStatus("Location unavailable — showing the sample campus area"),
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, []);
  return <div className="overflow-hidden rounded-2xl border border-slate-200">
    <div className="flex items-center justify-between bg-white px-4 py-3 text-xs text-slate-500"><span>{status}</span><span>© OpenStreetMap</span></div>
    <MapContainer center={center} zoom={14} scrollWheelZoom={true} style={{height: 340, width:"100%"}}>
      <Recenter center={center}/>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {places.map((p,i)=><Marker key={i} position={[p.lat,p.lon]} icon={pin}><Popup><b>{p.name}</b><br/>{p.type}<br/>{p.address}</Popup></Marker>)}
    </MapContainer>
  </div>;
}
