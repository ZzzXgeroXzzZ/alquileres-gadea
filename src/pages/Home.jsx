import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import FAQ from '../components/FAQ'
import CalendarioGeneral from '../components/CalendarioGeneral'
import MapaGeneral from '../components/MapaGeneral'

function Home() {
  const [casas, setCasas] = useState([])
  const [casasFiltradas, setCasasFiltradas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [precioMaximo, setPrecioMaximo] = useState('')

  useEffect(() => {
    async function cargarCasas() {
      setLoading(true)
      const { data, error } = await supabase
        .from('casas')
        .select('*')
        .eq('esta_activa', true)
        .order('id')
      
      if (error) {
        console.error('Error cargando casas:', error)
      } else {
        setCasas(data)
        setCasasFiltradas(data)
      }
      setLoading(false)
    }
    
    cargarCasas()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    let filtradas = [...casas]
    
    // Filtrar por nombre
    if (busqueda.trim()) {
      filtradas = filtradas.filter(casa => 
        casa.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (casa.descripcion && casa.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
      )
    }
    
    // Filtrar por precio máximo
    if (precioMaximo && !isNaN(precioMaximo)) {
      filtradas = filtradas.filter(casa => casa.precio_por_noche <= parseInt(precioMaximo))
    }
    
    setCasasFiltradas(filtradas)
  }, [busqueda, precioMaximo, casas])

  const limpiarFiltros = () => {
    setBusqueda('')
    setPrecioMaximo('')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '18px', color: '#92400e' }}>Cargando propiedades...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed' }}>
      <header style={{ backgroundColor: '#d97706', color: 'white', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>🏡 Alquileres Gadea</h1>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* FILTROS */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '4px' }}>🔍 Buscar</label>
            <input
              type="text"
              placeholder="Nombre o descripción..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>
          
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', display: 'block', marginBottom: '4px' }}>💰 Precio máximo</label>
            <input
              type="number"
              placeholder="Ej: 10000"
              value={precioMaximo}
              onChange={e => setPrecioMaximo(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>
          
          <button
            onClick={limpiarFiltros}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🧹 Limpiar filtros
          </button>
        </div>
        
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#92400e' }}>
          {casasFiltradas.length} {casasFiltradas.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
        </h2>
        
        {casasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '12px' }}>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>😕 No se encontraron propiedades con esos filtros</p>
            <button onClick={limpiarFiltros} style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Ver todas las propiedades
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {casasFiltradas.map((casa) => (
              <Link to={`/casa/${casa.id}`} key={casa.id} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={casa.fotos?.[0] || 'https://via.placeholder.com/400x300?text=Sin+foto'} 
                      alt={casa.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                      {casa.nombre}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.4' }}>
                      {casa.descripcion?.slice(0, 80)}...
                    </p>
                    <p style={{ fontSize: '16px', color: '#d97706', fontWeight: '500' }}>
  💰 Consultar precio
</p>
                    
                    <button style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}>
                      Ver disponibilidad
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <MapaGeneral />
        <CalendarioGeneral />
        <FAQ />
      </main>
    </div>
  )
}

export default Home