import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapaGeneral() {
  const [casas, setCasas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarCasas()
  }, [])

  async function cargarCasas() {
    const { data } = await supabase
      .from('casas')
      .select('id, nombre, latitud, longitud, ubicacion')
      .eq('esta_activa', true)
    
    if (data) setCasas(data)
    setLoading(false)
  }

  const casasConUbicacion = casas.filter(c => c.latitud && c.longitud)

  if (loading) {
    return <p style={{ textAlign: 'center', color: '#92400e', padding: '20px' }}>Cargando mapa...</p>
  }

  if (casasConUbicacion.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>📍 Cargá las coordenadas de las casas desde el Panel Admin para verlas en el mapa</p>
      </div>
    )
  }

  // Calcular centro del mapa
  const latitudes = casasConUbicacion.map(c => c.latitud)
  const longitudes = casasConUbicacion.map(c => c.longitud)
  const centroLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length
  const centroLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#92400e', marginBottom: '16px', textAlign: 'center' }}>
          🗺️ Nuestras propiedades
        </h2>
        
        <MapContainer 
          center={[centroLat, centroLng]} 
          zoom={12} 
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {casasConUbicacion.map(casa => (
            <Marker key={casa.id} position={[casa.latitud, casa.longitud]}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>{casa.nombre}</strong>
                  <br />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{casa.ubicacion}</span>
                  <br />
                  <Link 
                    to={`/casa/${casa.id}`}
                    style={{ 
                      display: 'inline-block', 
                      marginTop: '8px', 
                      padding: '6px 12px', 
                      backgroundColor: '#d97706', 
                      color: 'white', 
                      borderRadius: '4px', 
                      textDecoration: 'none', 
                      fontSize: '13px' 
                    }}
                  >
                    Ver propiedad
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', textAlign: 'center' }}>
          💡 Hacé clic en los marcadores para ver cada propiedad
        </p>
      </div>
    </div>
  )
}

export default MapaGeneral