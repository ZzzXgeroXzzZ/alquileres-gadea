import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import FAQ from '../components/FAQ'

function Home() {
  const [casas, setCasas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarCasas() {
      setLoading(true)
      const { data, error } = await supabase
        .from('casas')
        .select('*')
        .eq('esta_activa', true)
      
      if (error) {
        console.error('❌ Error cargando casas:', error)
      } else {
        console.log('🏠 Casas cargadas:', data)
        setCasas(data)
      }
      setLoading(false)
    }
    
    cargarCasas()
  }, [])

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
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#92400e' }}>
          Descubrí nuestras propiedades
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {casas.map((casa) => (
            <Link 
              to={`/casa/${casa.id}`}
              key={casa.id}
              style={{ textDecoration: 'none' }}
            >
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
              }}
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img 
                    src={casa.fotos?.[0] || 'https://via.placeholder.com/400x300?text=Sin+foto'} 
                    alt={casa.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                    {casa.nombre}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.4' }}>
                    {casa.descripcion?.slice(0, 80)}...
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>
                    ${casa.precio_por_noche?.toLocaleString('es-AR')} 
                    <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}> / noche</span>
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

             {/* FAQ - Preguntas frecuentes */}
        <FAQ />
      </main>
    </div>
  )
}

export default Home