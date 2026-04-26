import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

function CalendarioGeneral() {
  const [disponibilidad, setDisponibilidad] = useState({})
  const [mesActual, setMesActual] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDisponibilidad()
  }, [mesActual])

  async function cargarDisponibilidad() {
    setLoading(true)
    
    // Cargar todas las casas activas
    const { data: casas } = await supabase.from('casas').select('id, nombre').eq('esta_activa', true)
    
    // Cargar fechas bloqueadas
    const { data: fechas } = await supabase.from('fechas_bloqueadas').select('fecha, casa_id')
    
    const totalCasas = casas?.length || 0
    
    // Contar cuántas casas están bloqueadas por día
    const bloqueosPorDia = {}
    fechas?.forEach(f => {
      if (!bloqueosPorDia[f.fecha]) bloqueosPorDia[f.fecha] = 0
      bloqueosPorDia[f.fecha]++
    })
    
    // Crear disponibilidad
    const disp = {}
    Object.keys(bloqueosPorDia).forEach(fecha => {
      const bloqueadas = bloqueosPorDia[fecha]
      if (bloqueadas >= totalCasas) {
        disp[fecha] = 'rojo'      // Todas ocupadas
      } else if (bloqueadas > 0) {
        disp[fecha] = 'amarillo'  // Algunas ocupadas
      } else {
        disp[fecha] = 'verde'     // Todas libres
      }
    })
    
    setDisponibilidad(disp)
    setLoading(false)
  }

  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  const generarCalendario = () => {
    const año = mesActual.getFullYear()
    const mes = mesActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const dias = []
    
    for (let i = 0; i < primerDia.getDay(); i++) dias.push(null)
    
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const color = disponibilidad[fechaStr] || 'verde'
      const esPasado = new Date(fechaStr) < new Date(new Date().setHours(0, 0, 0, 0))
      dias.push({ dia: i, fecha: fechaStr, color, esPasado })
    }
    return dias
  }

  const mesAnterior = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  const mesSiguiente = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))

  if (loading) return <p style={{ textAlign: 'center', color: '#92400e' }}>Cargando calendario...</p>

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#92400e', marginBottom: '16px', textAlign: 'center' }}>
          📅 Disponibilidad general
        </h2>
        
        {/* Navegación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={mesAnterior} style={{ padding: '8px 16px', backgroundColor: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#92400e' }}>←</button>
          <span style={{ fontWeight: '600', textTransform: 'capitalize', color: '#92400e' }}>{mesActual.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={mesSiguiente} style={{ padding: '8px 16px', backgroundColor: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#92400e' }}>→</button>
        </div>

        {/* Días de la semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {nombresDias.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{d.slice(0, 3)}</div>)}
        </div>

        {/* Grid del calendario */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {generarCalendario().map((item, idx) => {
            if (!item) return <div key={idx} style={{ height: '40px' }} />
            return (
              <Link
                key={idx}
                to={item.esPasado ? '#' : `/casa/1`}
                style={{ textDecoration: 'none' }}
                onClick={(e) => { if (item.esPasado) e.preventDefault() }}
              >
                <div style={{
                  height: '40px',
                  borderRadius: '6px',
                  backgroundColor: item.esPasado ? '#f3f4f6' : item.color === 'rojo' ? '#fee2e2' : item.color === 'amarillo' ? '#fef3c7' : '#d1fae5',
                  border: item.color === 'rojo' ? '2px solid #dc2626' : item.color === 'amarillo' ? '2px solid #d97706' : '1px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.esPasado ? '#9ca3af' : item.color === 'rojo' ? '#dc2626' : item.color === 'amarillo' ? '#92400e' : '#065f46',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: item.esPasado ? 'not-allowed' : 'pointer',
                  opacity: item.esPasado ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}>
                  {item.dia}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '20px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#d1fae5', border: '2px solid #10b981', borderRadius: '4px' }}></div>
            <span style={{ color: '#065f46' }}>Disponible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#fef3c7', border: '2px solid #d97706', borderRadius: '4px' }}></div>
            <span style={{ color: '#92400e' }}>Parcial</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: '4px' }}></div>
            <span style={{ color: '#dc2626' }}>Completo</span>
          </div>
        </div>
        
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px', textAlign: 'center' }}>
          💡 Los días verdes tienen al menos una propiedad disponible
        </p>
      </div>
    </div>
  )
}

export default CalendarioGeneral