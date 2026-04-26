import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function ClienteReserva() {
  const { codigo } = useParams()
  const [consulta, setConsulta] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarConsulta()
  }, [codigo])

  async function cargarConsulta() {
    const { data } = await supabase
      .from('consultas')
      .select('*')
      .eq('codigo', codigo)
      .single()
    
    setConsulta(data)
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#fef7ed', minHeight: '100vh' }}>Cargando...</div>
  
  if (!consulta) return (
    <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#fef7ed', minHeight: '100vh' }}>
      <h2 style={{ color: '#dc2626' }}>❌ Reserva no encontrada</h2>
      <p style={{ color: '#6b7280' }}>El código ingresado no es válido.</p>
      <Link to="/" style={{ color: '#d97706' }}>← Volver al inicio</Link>
    </div>
  )

  const estadoColor = consulta.estado === 'Confirmada' ? '#10b981' : consulta.estado === 'Pendiente' ? '#d97706' : '#ef4444'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed' }}>
      <header style={{ backgroundColor: '#d97706', color: 'white', padding: 16, textAlign: 'center' }}>
        <h1 style={{ fontSize: 20 }}>🏡 Mi Reserva</h1>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 22, color: '#1f2937' }}>{consulta.casa_nombre}</h2>
            <span style={{ backgroundColor: estadoColor, color: 'white', padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: '600' }}>{consulta.estado}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ backgroundColor: '#fef7ed', padding: 12, borderRadius: 8 }}>
              <p>📅 Entrada: <strong>{consulta.fecha_entrada}</strong></p>
              <p>📅 Salida: <strong>{consulta.fecha_salida}</strong></p>
              <p>🌙 <strong>{consulta.noches} noches</strong></p>
            </div>

            {consulta.precio_final && (
              <div style={{ backgroundColor: '#d1fae5', padding: 12, borderRadius: 8 }}>
                <p>💰 Precio acordado: <strong>${consulta.precio_final?.toLocaleString('es-AR')}</strong></p>
              </div>
            )}

            {consulta.observacion && (
              <div style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 8 }}>
                <p>📝 <strong>{consulta.observacion}</strong></p>
              </div>
            )}
          </div>
        </div>

        <Link to="/" style={{ color: '#d97706', textDecoration: 'none' }}>← Volver al inicio</Link>
      </main>
    </div>
  )
}

export default ClienteReserva