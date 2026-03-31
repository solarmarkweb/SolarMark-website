'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

// Leaflet KML plugin might not be SSR friendly and needs window
function KmlLayer({ kmlUrl }) {
    const map = useMap();
    const layerRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !kmlUrl) return;

        // Dynamic import for the KML plugin to ensure it runs on the client
        const loadKml = async () => {
            try {
                // Leaflet-KML usually adds itself to L.KML
                // We might need to handle the plugin initialization
                require('leaflet-kml');
                
                const response = await fetch(kmlUrl);
                const kmlText = await response.text();
                const parser = new DOMParser();
                const kmlDom = parser.parseFromString(kmlText, 'text/xml');
                
                if (L.KML) {
                    const track = new L.KML(kmlDom);
                    map.addLayer(track);
                    
                    const bounds = track.getBounds();
                    if (bounds.isValid()) {
                        map.fitBounds(bounds);
                    }
                    
                    layerRef.current = track;
                }
            } catch (err) {
                console.error('Error loading KML:', err);
            }
        };

        loadKml();

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, kmlUrl]);

    return null;
}

export default function KmlViewer({ kmlUrl }) {
    // Default position if KML fails to load or before it centers
    const center = [20.5937, 78.9629]; // India center

    useEffect(() => {
        // Fix Leaflet marker icon issues in Next.js
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    return (
        <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden shadow-inner border border-slate-700 bg-slate-900 relative">
            <MapContainer 
                center={center} 
                zoom={5} 
                style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {kmlUrl && <KmlLayer kmlUrl={kmlUrl} />}
            </MapContainer>
            
            {/* Map Overlay for Branding */}
            <div className="absolute top-4 right-4 z-[1000] bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] pointer-events-none">
                Live Spatial Intelligence
            </div>
        </div>
    );
}
