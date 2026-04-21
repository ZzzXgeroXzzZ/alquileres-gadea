import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function DetalleCasa() {
  const { id } = useParams()
  const [casa, setCasa] = useState(null)
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const [fechaEntrada, setFechaEntrada] = useState(null)
  const [fechaSalida, setFechaSalida] = useState(null)
  const [mesActual, setMesActual] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarCasa() {
      setLoading(true)
      
      // Cargar datos de la casa
      const { data: casaData, error: casaError } = await supabase
        .from('casas')
        .select('*')
        .eq('id', id)
        .single()
      
      if (casaError) {
        console.error('❌ Error cargando casa:', casaError)
        setLoading(false)
        return
      }
      
      setCasa(casaData)
      
      // Cargar fechas bloqueadas
      const { data: fechasData, error: fechasError } = await supabase
        .from('fechas_bloqueadas')
        .select('fecha')
        .eq('casa_id', id)
      
      if (fechasError) {
        console.error('❌ Error cargando fechas:', fechasError)
      } else {
        const fechas = fechasData.map(f => f.fecha)
        setFechasOcupadas(fechas)
      }
      
      setLoading(false)
    }
    
    cargarCasa()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '18px', color: '#92400e' }}>Cargando propiedad...</p>
      </div>
    )
  }
  
  if (!casa) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '18px', color: '#92400e' }}>Propiedad no encontrada</p>
      </div>
    )
  }
  
  // Cambiar de mes
  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  }
  
  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))
  }
  
  // Generar calendario para el mes actual
  const generarCalendario = () => {
    const año = mesActual.getFullYear()
    const mes = mesActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const dias = []
    
    const diaSemanaPrimero = primerDia.getDay()
    for (let i = 0; i < diaSemanaPrimero; i++) {
      dias.push(null)
    }
    
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      dias.push({
        dia: i,
        fecha: fechaStr,
        ocupado: fechasOcupadas.includes(fechaStr),
        esPasado: new Date(fechaStr) < new Date(new Date().setHours(0, 0, 0, 0))
      })
    }
    
    return dias
  }
  
  const diasCalendario = generarCalendario()
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  // Manejar selección de fechas
  const handleSeleccionarFecha = (fechaStr) => {
    const fecha = new Date(fechaStr)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    if (fecha < hoy) return
    
    if (fechaEntrada && !fechaSalida) {
      const entrada = new Date(fechaEntrada)
      
      if (fecha > entrada) {
        let hayOcupado = false
        const fechaCheck = new Date(entrada)
        
        while (fechaCheck <= fecha) {
          const fechaCheckStr = fechaCheck.toISOString().split('T')[0]
          if (fechasOcupadas.includes(fechaCheckStr)) {
            hayOcupado = true
            break
          }
          fechaCheck.setDate(fechaCheck.getDate() + 1)
        }
        
        if (!hayOcupado) {
          setFechaSalida(fechaStr)
        } else {
          alert('Hay fechas ocupadas en el rango seleccionado')
        }
      } else if (fecha < entrada) {
        setFechaEntrada(fechaStr)
        setFechaSalida(null)
      } else {
        setFechaEntrada(null)
        setFechaSalida(null)
      }
    } else {
      setFechaEntrada(fechaStr)
      setFechaSalida(null)
    }
  }
  
  const calcularNoches = () => {
    if (!fechaEntrada || !fechaSalida) return 0
    const diff = new Date(fechaSalida) - new Date(fechaEntrada)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }
  
  const noches = calcularNoches()
  
  const esReservaLejana = () => {
    if (!fechaEntrada) return false
    const entrada = new Date(fechaEntrada)
    const hoy = new Date()
    const tresMesesDespues = new Date()
    tresMesesDespues.setMonth(hoy.getMonth() + 3)
    return entrada > tresMesesDespues
  }
  
  const mensajeWhatsApp = () => {
    const fechaEntradaFormateada = fechaEntrada ? new Date(fechaEntrada).toLocaleDateString('es-AR') : ''
    const fechaSalidaFormateada = fechaSalida ? new Date(fechaSalida).toLocaleDateString('es-AR') : ''
    
    const texto = `Hola! Me interesa reservar *${casa.nombre}*.
📅 Fechas: del *${fechaEntradaFormateada}* al *${fechaSalidaFormateada}* (${noches} ${noches === 1 ? 'noche' : 'noches'}).
💰 Por favor, confirmame el precio total y la disponibilidad. ¡Gracias!`
    
    return encodeURIComponent(texto)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed' }}>
      <header style={{ backgroundColor: '#d97706', color: 'white', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</Link>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{casa.nombre}</h1>
        </div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Galería */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '24px' }}>
          {casa.fotos?.map((foto, idx) => (
            <img 
              key={idx}
              src={foto} 
              alt={`${casa.nombre} ${idx + 1}`}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ))}
        </div>
        
        {/* Info y Calendario */}
        <div className="grid-container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '24px'
        }}>
          <style>{`
            @media (min-width: 768px) {
              .grid-container {
                grid-template-columns: 1fr 1fr !important;
              }
            }
          `}</style>
          
          {/* Columna izquierda - Info */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#92400e' }}>📋 Detalles de la propiedad</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.6' }}>{casa.descripcion}</p>
            
            {/* Precio */}
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', marginBottom: '24px' }}>
              ${casa.precio_por_noche?.toLocaleString('es-AR')} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#6b7280' }}>/ noche</span>
            </p>
            
            {/* Servicios incluidos */}
            {casa.servicios?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                  ✨ Servicios incluidos
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {casa.servicios.map((servicio, idx) => (
                    <div key={idx} style={{ fontSize: '14px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {servicio}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reglas de la casa */}
            {casa.reglas?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e' }}>
                  📜 Reglas de la casa
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {casa.reglas.map((regla, idx) => (
                    <li key={idx} style={{ fontSize: '14px', color: '#4b5563', padding: '6px 0', borderBottom: '1px solid #fef3c7' }}>
                      {regla}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Ubicación */}
            {casa.ubicacion && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>📍 Ubicación</h3>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>{casa.ubicacion}</p>
              </div>
            )}
            
            {/* Resumen de reserva */}
            {fechaEntrada && fechaSalida && (
              <div style={{ backgroundColor: '#fef7ed', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>📋 Resumen de tu estadía</p>
                <p>📅 Entrada: {new Date(fechaEntrada).toLocaleDateString('es-AR')}</p>
                <p>📅 Salida: {new Date(fechaSalida).toLocaleDateString('es-AR')}</p>
                <p>🌙 {noches} {noches === 1 ? 'noche' : 'noches'}</p>
                <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '12px', fontStyle: 'italic' }}>
                  💬 El precio final será confirmado por WhatsApp
                </p>
                
                {esReservaLejana() && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#92400e'
                  }}>
                    ⚠️ Para reservas con más de 3 meses de anticipación, los precios pueden variar. 
                    Te confirmaremos el valor final por WhatsApp.
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Columna derecha - Calendario */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {/* Navegación de meses */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <button 
                onClick={mesAnterior}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#fef3c7',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#92400e'
                }}
              >
                ← Anterior
              </button>
              
              <h3 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize', color: '#92400e' }}>
                {mesActual.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
              </h3>
              
              <button 
                onClick={mesSiguiente}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#fef3c7',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#92400e'
                }}
              >
                Siguiente →
              </button>
            </div>
            
            {/* Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {nombresDias.map(dia => (
                <div key={dia} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  {dia.slice(0, 3)}
                </div>
              ))}
            </div>
            
            {/* Grid del calendario */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {diasCalendario.map((item, idx) => {
                if (!item) return <div key={idx} style={{ height: '40px' }} />
                
                const fechaSeleccionada = item.fecha === fechaEntrada || item.fecha === fechaSalida
                const enRango = fechaEntrada && fechaSalida && 
                  new Date(item.fecha) > new Date(fechaEntrada) && 
                  new Date(item.fecha) < new Date(fechaSalida)
                const estaOcupado = item.ocupado
                const esPasado = item.esPasado
                
                return (
                  <button
                    key={idx}
                    onClick={() => !estaOcupado && !esPasado && handleSeleccionarFecha(item.fecha)}
                    disabled={estaOcupado || esPasado}
                    style={{
                      height: '40px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: estaOcupado 
                        ? '#fee2e2' 
                        : esPasado
                          ? '#f3f4f6'
                          : fechaSeleccionada 
                            ? '#d97706' 
                            : enRango 
                              ? '#fef3c7' 
                              : 'white',
                      color: estaOcupado 
                        ? '#dc2626' 
                        : esPasado
                          ? '#9ca3af'
                          : fechaSeleccionada 
                            ? 'white' 
                            : '#1f2937',
                      cursor: (estaOcupado || esPasado) ? 'not-allowed' : 'pointer',
                      fontWeight: fechaSeleccionada ? '600' : '400',
                      opacity: (estaOcupado || esPasado) ? 0.6 : 1,
                      transition: 'all 0.1s',
                      fontSize: '14px'
                    }}
                  >
                    {item.dia}
                  </button>
                )
              })}
            </div>
            
            {/* Leyenda */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fee2e2', borderRadius: '4px', border: '1px solid #fca5a5' }}></div>
                <span>Ocupado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#d97706', borderRadius: '4px' }}></div>
                <span>Seleccionado</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fef3c7', borderRadius: '4px' }}></div>
                <span>Rango</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#f3f4f6', borderRadius: '4px', border: '1px solid #d1d5db' }}></div>
                <span>Pasado</span>
              </div>
            </div>
            
            {/* Instrucciones */}
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '16px' }}>
              💡 Hacé clic en la fecha de entrada y luego en la de salida
            </p>
            
            {/* Botón WhatsApp */}
            {fechaEntrada && fechaSalida && (
              <a
                href={`https://wa.me/2494320917?text=${mensajeWhatsApp()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  textAlign: 'center',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '18px'
                }}
              >
                📱 Reservar por WhatsApp
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DetalleCasa