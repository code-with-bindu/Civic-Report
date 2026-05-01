import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, useMapEvent } from 'react-leaflet';

// Fix for default marker icon
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function LocationMap({ location, onLocationSelect, editable = false }) {
    const defaultCenter = [20.5937, 78.9629]; // India center
    const center = location ? [location.latitude, location.longitude] : defaultCenter;
    const zoom = location ? 14 : 4;

    function MapClickHandler() {
        useMapEvent('click', (e) => {
            if (editable) {
                onLocationSelect({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                });
            }
        });
        return null;
    }

    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {location && (
                    <Marker position={[location.latitude, location.longitude]}>
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold">Issue Location</p>
                                <p className="text-xs text-gray-600">
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}
                {editable && <MapClickHandler />}
            </MapContainer>
        </div>
    );
}
