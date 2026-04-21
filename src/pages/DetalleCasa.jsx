import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import Mapa from '../components/Mapa'

function DetalleCasa() {
  const { id } = useParams()
  const [casa, setCasa] = useState(null)
  const [fechasOcupadas, setFechasOcupadas] = useState([])
  const [fechaEntrada, setFechaEntrada] = useState(null)
  const [fechaSalida, setFechaSalida] = useState(null)
  const [mesActual, setMesActual] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [indiceFoto, setIndiceFoto] = useState(0)
  const [lightboxAbierto, setLightboxAbierto] = useState(false)

  useEffect(() => {
    async function cargarCasa() {
      setLoading(true)
      
      const { data: casaData, error: casaError } = await supabase
        .from('casas')
        .select('*')
        .eq('id', id)
        .single()
      
      if (casaError) {
        console.error('Error cargando casa:', casaError)
        setLoading(false)
        return
      }
      
      setCasa(casaData)
      
      const { data: fechasData, error: fechasError } = await supabase
        .from('fechas_bloqueadas')
        .select('fecha')
        .eq('casa_id', id)
      
      if (fechasError) {
        console.error('Error cargando fechas:', fechasError)
      } else {
        setFechasOcupadas(fechasData.map(f => f.fecha))
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
  
  const mesAnterior = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  const mesSiguiente = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))
  
  const generarCalendario = () => {
    const año = mesActual.getFullYear()
    const mes = mesActual.getMonth()
    const primerDia = new Date(año, mes, 1)
    const ultimoDia = new Date(año, mes + 1, 0)
    const dias = []
    
    for (let i = 0; i < primerDia.getDay(); i++) dias.push(null)
    
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
          if (fechasOcupadas.includes(fechaCheck.toISOString().split('T')[0])) {
            hayOcupado = true
            break
          }
          fechaCheck.setDate(fechaCheck.getDate() + 1)
        }
        if (!hayOcupado) setFechaSalida(fechaStr)
        else alert('Hay fechas ocupadas en el rango seleccionado')
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
    return Math.ceil((new Date(fechaSalida) - new Date(fechaEntrada)) / (1000 * 60 * 60 * 24))
  }
  
  const noches = calcularNoches()
  
  const esReservaLejana = () => {
    if (!fechaEntrada) return false
    const entrada = new Date(fechaEntrada)
    const tresMesesDespues = new Date()
    tresMesesDespues.setMonth(new Date().getMonth() + 3)
    return entrada > tresMesesDespues
  }
  
  const mensajeWhatsApp = () => {
    const entrada = fechaEntrada ? new Date(fechaEntrada).toLocaleDateString('es-AR') : ''
    const salida = fechaSalida ? new Date(fechaSalida).toLocaleDateString('es-AR') : ''
    const texto = `Hola! Me interesa reservar *${casa.nombre}*.\n📅 Fechas: del *${entrada}* al *${salida}* (${noches} noches).\n💰 Por favor, confirmame el precio total. ¡Gracias!`
    return encodeURIComponent(texto)
  }

  const handleReserva = async () => {
    // Guardar consulta en Supabase
    await supabase.from('consultas').insert({
      casa_id: casa.id,
      casa_nombre: casa.nombre,
      fecha_entrada: fechaEntrada,
      fecha_salida: fechaSalida,
      noches: noches,
      estado: 'Pendiente'
    })
    
    // Abrir WhatsApp
    window.open(`https://wa.me/2494320917?text=${mensajeWhatsApp()}`, '_blank')
  }

  const fotos = casa.fotos || []
  const siguienteFoto = () => setIndiceFoto((indiceFoto + 1) % fotos.length)
  const anteriorFoto = () => setIndiceFoto((indiceFoto - 1 + fotos.length) % fotos.length)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed' }}>
      <header style={{ backgroundColor: '#d97706', color: 'white', padding: '16px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px' }}>←</Link>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{casa.nombre}</h1>
        </div>
      </header>
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        {/* CARRUSEL INTEGRADO */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          {fotos.length > 0 ? (
            <>
              <div 
                className="carrusel-container"
                style={{ 
                  position: 'relative', 
                  height: '300px', 
                  overflow: 'hidden', 
                  borderRadius: '8px',
                  backgroundColor: '#000'
                }}
              >
                <style>{`
                  @media (min-width: 768px) {
                    .carrusel-container {
                      height: 500px !important;
                    }
                  }
                `}</style>
                <img 
                  src={fotos[indiceFoto]} 
                  alt={`Foto ${indiceFoto + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', cursor: 'pointer' }}
                  onClick={() => setLightboxAbierto(true)}
                />
                <div style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px' }}>
                  {indiceFoto + 1} / {fotos.length}
                </div>
              </div>
              
              {fotos.length > 1 && (
                <>
                  <button onClick={anteriorFoto} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: '20px', color: '#d97706' }}>←</button>
                  <button onClick={siguienteFoto} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: '20px', color: '#d97706' }}>→</button>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                    {fotos.map((_, idx) => (
                      <button key={idx} onClick={() => setIndiceFoto(idx)} style={{ width: idx === indiceFoto ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: idx === indiceFoto ? '#d97706' : '#d1d5db', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ height: '300px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <span style={{ color: '#6b7280' }}>📷 Sin fotos</span>
            </div>
          )}
        </div>
        
        {/* Info y Calendario */}
        <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <style>{`@media (min-width: 768px) { .grid-container { grid-template-columns: 1fr 1fr !important; } }`}</style>
          
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px', color: '#92400e' }}>📋 Detalles de la propiedad</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px', lineHeight: '1.6' }}>{casa.descripcion}</p>
            
            <p style={{ fontSize: '20px', color: '#d97706', marginBottom: '24px', fontWeight: '500' }}>
              💰 Consultar precio por WhatsApp
            </p>
            
            {casa.servicios?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>✨ Servicios incluidos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {casa.servicios.map((s, i) => <div key={i} style={{ fontSize: '14px', color: '#4b5563' }}>{s}</div>)}
                </div>
              </div>
            )}
            
            {casa.reglas?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>📜 Reglas de la casa</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {casa.reglas.map((r, i) => <li key={i} style={{ fontSize: '14px', color: '#4b5563', padding: '6px 0', borderBottom: '1px solid #fef3c7' }}>{r}</li>)}
                </ul>
              </div>
            )}
            
            {/* UBICACIÓN Y MAPA */}
            {casa.ubicacion && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>📍 Ubicación</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>{casa.ubicacion}</p>
                <Mapa latitud={casa.latitud} longitud={casa.longitud} nombre={casa.nombre} />
              </div>
            )}
            
            {fechaEntrada && fechaSalida && (
              <div style={{ backgroundColor: '#fef7ed', padding: '16px', borderRadius: '8px', marginTop: '24px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>📋 Resumen de tu estadía</p>
                <p>📅 Entrada: {new Date(fechaEntrada).toLocaleDateString('es-AR')}</p>
                <p>📅 Salida: {new Date(fechaSalida).toLocaleDateString('es-AR')}</p>
                <p>🌙 {noches} {noches === 1 ? 'noche' : 'noches'}</p>
                <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '12px', fontStyle: 'italic' }}>💬 El precio final será confirmado por WhatsApp</p>
                {esReservaLejana() && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '14px', color: '#92400e' }}>
                    ⚠️ Para reservas con más de 3 meses de anticipación, los precios pueden variar.
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <button onClick={mesAnterior} style={{ padding: '8px 12px', backgroundColor: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#92400e' }}>← Anterior</button>
              <h3 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize', color: '#92400e' }}>{mesActual.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</h3>
              <button onClick={mesSiguiente} style={{ padding: '8px 12px', backgroundColor: '#fef3c7', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#92400e' }}>Siguiente →</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {nombresDias.map(d => <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{d.slice(0, 3)}</div>)}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {diasCalendario.map((item, idx) => {
                if (!item) return <div key={idx} style={{ height: '40px' }} />
                const seleccionado = item.fecha === fechaEntrada || item.fecha === fechaSalida
                const enRango = fechaEntrada && fechaSalida && new Date(item.fecha) > new Date(fechaEntrada) && new Date(item.fecha) < new Date(fechaSalida)
                return (
                  <button key={idx} onClick={() => !item.ocupado && !item.esPasado && handleSeleccionarFecha(item.fecha)} disabled={item.ocupado || item.esPasado}
                    style={{ height: '40px', border: 'none', borderRadius: '4px', backgroundColor: item.ocupado ? '#fee2e2' : item.esPasado ? '#f3f4f6' : seleccionado ? '#d97706' : enRango ? '#fef3c7' : 'white', color: item.ocupado ? '#dc2626' : item.esPasado ? '#9ca3af' : seleccionado ? 'white' : '#1f2937', cursor: (item.ocupado || item.esPasado) ? 'not-allowed' : 'pointer', opacity: (item.ocupado || item.esPasado) ? 0.6 : 1 }}
                  >{item.dia}</button>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#fee2e2', borderRadius: '4px' }}></div><span>Ocupado</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#d97706', borderRadius: '4px' }}></div><span>Seleccionado</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#fef3c7', borderRadius: '4px' }}></div><span>Rango</span></div>
            </div>
            
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '16px' }}>💡 Hacé clic en la fecha de entrada y luego en la de salida</p>
            
            {fechaEntrada && fechaSalida && (
              <button
                onClick={handleReserva}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                📱 Reservar por WhatsApp
              </button>
            )}
          </div>
        </div>
      </main>
      
      {/* LIGHTBOX */}
      {lightboxAbierto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setLightboxAbierto(false)}
        >
          <span 
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              color: 'white',
              fontSize: '40px',
              cursor: 'pointer',
              fontWeight: 'bold',
              zIndex: 10000
            }}
            onClick={() => setLightboxAbierto(false)}
          >
            ✕
          </span>
          
          <img 
            src={fotos[indiceFoto]} 
            alt="Vista ampliada"
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90%', 
              objectFit: 'contain',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '8px 20px',
            borderRadius: '30px',
            fontSize: '16px'
          }}>
            {indiceFoto + 1} / {fotos.length}
          </div>
          
          {fotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIndiceFoto((indiceFoto - 1 + fotos.length) % fotos.length)
                }}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: 'none',
                  fontSize: '30px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIndiceFoto((indiceFoto + 1) % fotos.length)
                }}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: 'none',
                  fontSize: '30px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DetalleCasa