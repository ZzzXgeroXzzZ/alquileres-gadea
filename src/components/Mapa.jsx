import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Arreglar íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function Mapa({ latitud, longitud, nombre }) {
  if (!latitud || !longitud) {
    return (
      <div style={{ height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
        <span style={{ color: '#6b7280' }}>📍 Ubicación no disponible</span>
      </div>
    )
  }

  return (
    <MapContainer center={[latitud, longitud]} zoom={13} style={{ height: '200px', width: '100%', borderRadius: '8px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitud, longitud]}>
        <Popup>{nombre}</Popup>
      </Marker>
    </MapContainer>
  )
}

export default Mapa