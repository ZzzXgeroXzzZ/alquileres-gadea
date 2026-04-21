import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sesion, setSesion] = useState(null)
  const [casas, setCasas] = useState([])
  const [casaEditando, setCasaEditando] = useState(null)
  const [mesActual, setMesActual] = useState(new Date())
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaRegla, setNuevaRegla] = useState('')
  const [nuevoServicio, setNuevoServicio] = useState('')
  const [mostrarFormNuevaCasa, setMostrarFormNuevaCasa] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [nuevaCasa, setNuevaCasa] = useState({
    nombre: '',
    descripcion: '',
    precio_por_noche: '',
    ubicacion: ''
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      if (session) cargarCasas()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
      if (session) cargarCasas()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function cargarCasas() {
    const { data } = await supabase.from('casas').select('*').order('id')
    if (data) setCasas(data)
  }

  async function cargarFechasBloqueadas(casaId) {
    const { data } = await supabase.from('fechas_bloqueadas').select('fecha').eq('casa_id', casaId)
    setFechasBloqueadas(data?.map(f => f.fecha) || [])
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
    } else {
      setSesion(data.session)
      await cargarCasas()
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSesion(null)
    setEmail('')
    setPassword('')
    setCasas([])
  }

  async function toggleCasaActiva(id, estadoActual) {
    await supabase.from('casas').update({ esta_activa: !estadoActual }).eq('id', id)
    cargarCasas()
  }

  async function actualizarPrecio(id) {
    if (!nuevoPrecio || nuevoPrecio <= 0) return
    await supabase.from('casas').update({ precio_por_noche: parseInt(nuevoPrecio) }).eq('id', id)
    cargarCasas()
    setNuevoPrecio('')
  }

  async function actualizarDescripcion(id) {
    if (!nuevaDescripcion.trim()) return
    await supabase.from('casas').update({ descripcion: nuevaDescripcion }).eq('id', id)
    cargarCasas()
    setNuevaDescripcion('')
  }

  async function actualizarNombre(id) {
    if (!nuevoNombre.trim()) return
    await supabase.from('casas').update({ nombre: nuevoNombre }).eq('id', id)
    cargarCasas()
    setNuevoNombre('')
  }

  async function agregarRegla(id, reglasActuales) {
    if (!nuevaRegla.trim()) return
    const nuevasReglas = [...reglasActuales, nuevaRegla]
    await supabase.from('casas').update({ reglas: nuevasReglas }).eq('id', id)
    cargarCasas()
    setNuevaRegla('')
  }

  async function eliminarRegla(id, reglasActuales, index) {
    const nuevasReglas = reglasActuales.filter((_, i) => i !== index)
    await supabase.from('casas').update({ reglas: nuevasReglas }).eq('id', id)
    cargarCasas()
  }

  async function agregarServicio(id, serviciosActuales) {
    if (!nuevoServicio.trim()) return
    const nuevosServicios = [...serviciosActuales, nuevoServicio]
    await supabase.from('casas').update({ servicios: nuevosServicios }).eq('id', id)
    cargarCasas()
    setNuevoServicio('')
  }

  async function eliminarServicio(id, serviciosActuales, index) {
    const nuevosServicios = serviciosActuales.filter((_, i) => i !== index)
    await supabase.from('casas').update({ servicios: nuevosServicios }).eq('id', id)
    cargarCasas()
  }

  async function toggleFechaBloqueada(casaId, fecha) {
    const existe = fechasBloqueadas.includes(fecha)
    if (existe) {
      await supabase.from('fechas_bloqueadas').delete().eq('casa_id', casaId).eq('fecha', fecha)
      setFechasBloqueadas(fechasBloqueadas.filter(f => f !== fecha))
    } else {
      await supabase.from('fechas_bloqueadas').insert({ casa_id: casaId, fecha })
      setFechasBloqueadas([...fechasBloqueadas, fecha])
    }
  }

  async function crearCasa() {
    if (!nuevaCasa.nombre || !nuevaCasa.precio_por_noche) {
      alert('Nombre y precio son obligatorios')
      return
    }
    
    const { error } = await supabase.from('casas').insert({
      nombre: nuevaCasa.nombre,
      descripcion: nuevaCasa.descripcion || 'Nueva propiedad',
      precio_por_noche: parseInt(nuevaCasa.precio_por_noche),
      ubicacion: nuevaCasa.ubicacion || '',
      fotos: ['https://via.placeholder.com/400x300?text=Agregar+foto'],
      reglas: [],
      servicios: [],
      esta_activa: true
    })
    
    if (error) {
      alert('Error al crear la casa: ' + error.message)
    } else {
      cargarCasas()
      setMostrarFormNuevaCasa(false)
      setNuevaCasa({ nombre: '', descripcion: '', precio_por_noche: '', ubicacion: '' })
    }
  }

  async function eliminarCasa(id, nombre) {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
      return
    }

    // Subir una nueva foto
async function subirFoto(casaId, archivo) {
  if (!archivo) return
  
  setSubiendoFoto(true)
  
  const nombreArchivo = `${casaId}_${Date.now()}_${archivo.name}`
  
  const { error: uploadError } = await supabase.storage
    .from('fotos-casas')
    .upload(nombreArchivo, archivo)
  
  if (uploadError) {
    alert('Error al subir la foto: ' + uploadError.message)
    setSubiendoFoto(false)
    return
  }
  
  const { data: urlData } = supabase.storage
    .from('fotos-casas')
    .getPublicUrl(nombreArchivo)
  
  const nuevaFoto = urlData.publicUrl
  
  const { data: casaData } = await supabase
    .from('casas')
    .select('fotos')
    .eq('id', casaId)
    .single()
  
  const fotosActuales = casaData?.fotos || []
  const nuevasFotos = [...fotosActuales, nuevaFoto]
  
  const { error: updateError } = await supabase
    .from('casas')
    .update({ fotos: nuevasFotos })
    .eq('id', casaId)
  
  if (updateError) {
    alert('Error al actualizar: ' + updateError.message)
  } else {
    cargarCasas()
  }
  
  setSubiendoFoto(false)
}

// Eliminar una foto
async function eliminarFoto(casaId, fotoUrl, fotosActuales) {
  const urlParts = fotoUrl.split('/')
  const nombreArchivo = urlParts[urlParts.length - 1]
  
  await supabase.storage
    .from('fotos-casas')
    .remove([nombreArchivo])
  
  const nuevasFotos = fotosActuales.filter(f => f !== fotoUrl)
  
  await supabase
    .from('casas')
    .update({ fotos: nuevasFotos })
    .eq('id', casaId)
  
  cargarCasas()
}

// Establecer como foto principal
async function setFotoPrincipal(casaId, fotoUrl, fotosActuales) {
  const nuevasFotos = [
    fotoUrl,
    ...fotosActuales.filter(f => f !== fotoUrl)
  ]
  
  await supabase
    .from('casas')
    .update({ fotos: nuevasFotos })
    .eq('id', casaId)
  
  cargarCasas()
}
    
    await supabase.from('fechas_bloqueadas').delete().eq('casa_id', id)
    const { error } = await supabase.from('casas').delete().eq('id', id)
    
    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      cargarCasas()
    }
  }

  const mesAnterior = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))
  const mesSiguiente = () => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))
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
      dias.push({
        dia: i,
        fecha: fechaStr,
        bloqueado: fechasBloqueadas.includes(fechaStr),
        esPasado: new Date(fechaStr) < new Date(new Date().setHours(0, 0, 0, 0))
      })
    }
    return dias
  }

  // PANTALLA DE LOGIN
  if (!sesion) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <div style={{ backgroundColor: 'white', padding: 32, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#92400e', textAlign: 'center', marginBottom: 24 }}>
            🔐 Panel Administrador
          </h2>
          
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16 }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16 }}
            />
            
            {error && <p style={{ color: '#dc2626', marginBottom: 16, fontSize: 14 }}>{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ color: '#d97706', textDecoration: 'none', fontSize: 14 }}>← Volver al inicio</Link>
          </p>
        </div>
      </div>
    )
  }

  // PANTALLA DE ADMINISTRACIÓN
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef7ed' }}>
      <header style={{ backgroundColor: '#92400e', color: 'white', padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 'bold' }}>🏠 Panel Administrador - Alquileres Gadea</h1>
          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#d97706', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: '500' }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <Link to="/" style={{ color: '#d97706', textDecoration: 'none', fontSize: 14 }}>← Ver sitio público</Link>
        
        {/* Botón Nueva Casa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, color: '#92400e', margin: 0 }}>Mis Propiedades</h2>
          <button
            onClick={() => setMostrarFormNuevaCasa(!mostrarFormNuevaCasa)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            {mostrarFormNuevaCasa ? '❌ Cancelar' : '➕ Nueva Casa'}
          </button>
        </div>

        {/* Formulario Nueva Casa */}
        {mostrarFormNuevaCasa && (
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 18, fontWeight: '600', color: '#92400e', marginBottom: 16 }}>🏠 Agregar nueva propiedad</h3>
            
            <div style={{ display: 'grid', gap: 12 }}>
              <input
                type="text"
                placeholder="Nombre de la casa *"
                value={nuevaCasa.nombre}
                onChange={e => setNuevaCasa({...nuevaCasa, nombre: e.target.value})}
                style={{ padding: 12, borderRadius: 6, border: '1px solid #d1d5db' }}
              />
              
              <input
                type="text"
                placeholder="Descripción"
                value={nuevaCasa.descripcion}
                onChange={e => setNuevaCasa({...nuevaCasa, descripcion: e.target.value})}
                style={{ padding: 12, borderRadius: 6, border: '1px solid #d1d5db' }}
              />
              
              <input
                type="number"
                placeholder="Precio por noche *"
                value={nuevaCasa.precio_por_noche}
                onChange={e => setNuevaCasa({...nuevaCasa, precio_por_noche: e.target.value})}
                style={{ padding: 12, borderRadius: 6, border: '1px solid #d1d5db' }}
              />
              
              <input
                type="text"
                placeholder="Ubicación"
                value={nuevaCasa.ubicacion}
                onChange={e => setNuevaCasa({...nuevaCasa, ubicacion: e.target.value})}
                style={{ padding: 12, borderRadius: 6, border: '1px solid #d1d5db' }}
              />
              
              <button
                onClick={crearCasa}
                style={{
                  padding: 14,
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                ✅ Crear propiedad
              </button>
            </div>
          </div>
        )}

        {/* Lista de casas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {casas.map(casa => (
            <div key={casa.id} style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', opacity: casa.esta_activa ? 1 : 0.6 }}>
              
              {/* Cabecera de la casa */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img 
                    src={casa.fotos?.[0] || 'https://via.placeholder.com/80'} 
                    alt={casa.nombre}
                    style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>{casa.nombre}</h3>
                    <p style={{ fontSize: 14, color: '#6b7280' }}>${casa.precio_por_noche?.toLocaleString('es-AR')} / noche</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleCasaActiva(casa.id, casa.esta_activa)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: casa.esta_activa ? '#10b981' : '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {casa.esta_activa ? '✅ Activa' : '⏸️ Pausada'}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (casaEditando === casa.id) {
                        setCasaEditando(null)
                      } else {
                        setCasaEditando(casa.id)
                        cargarFechasBloqueadas(casa.id)
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#d97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {casaEditando === casa.id ? 'Cerrar' : '✏️ Editar'}
                  </button>
                  
                  <button
                    onClick={() => eliminarCasa(casa.id, casa.nombre)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>

              {/* Panel de edición */}
              {casaEditando === casa.id && (
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #fef3c7' }}>
                  
                  {/* Editar nombre */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 8 }}>📛 Nombre</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder={`Actual: ${casa.nombre}`}
                        value={nuevoNombre}
                        onChange={e => setNuevoNombre(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                      />
                      <button
                        onClick={() => actualizarNombre(casa.id)}
                        style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* Gestionar fotos */}
<div style={{ marginBottom: 20 }}>
  <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 8 }}>🖼️ Fotos de la propiedad</label>
  
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
    {casa.fotos?.map((foto, idx) => (
      <div key={idx} style={{ position: 'relative', width: 80, height: 80 }}>
        <img 
          src={foto} 
          alt={`Foto ${idx + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
        />
        <button
          onClick={() => eliminarFoto(casa.id, foto, casa.fotos)}
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: '#dc2626',
            color: 'white',
            border: '2px solid white',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>
        {idx !== 0 && (
          <button
            onClick={() => setFotoPrincipal(casa.id, foto, casa.fotos)}
            style={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              padding: '2px 6px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 10,
              cursor: 'pointer'
            }}
          >
            ⭐ Principal
          </button>
        )}
        {idx === 0 && (
          <span style={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            padding: '2px 6px',
            backgroundColor: '#d97706',
            color: 'white',
            borderRadius: 4,
            fontSize: 10
          }}>
            ⭐ Principal
          </span>
        )}
      </div>
    ))}
  </div>
  
  <div>
    <input
      type="file"
      accept="image/*"
      id={`upload-foto-${casa.id}`}
      style={{ display: 'none' }}
      onChange={async (e) => {
        const archivo = e.target.files[0]
        if (archivo) {
          await subirFoto(casa.id, archivo)
          e.target.value = ''
        }
      }}
    />
    <button
      onClick={() => document.getElementById(`upload-foto-${casa.id}`).click()}
      disabled={subiendoFoto}
      style={{
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: subiendoFoto ? 'not-allowed' : 'pointer',
        opacity: subiendoFoto ? 0.7 : 1,
        fontSize: 14
      }}
    >
      {subiendoFoto ? '⏳ Subiendo...' : '📤 Subir nueva foto'}
    </button>
    <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 12 }}>
      La primera foto será la principal
    </span>
  </div>
</div>


                  {/* Editar precio */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 8 }}>💰 Precio por noche</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number"
                        placeholder={`Actual: $${casa.precio_por_noche}`}
                        value={nuevoPrecio}
                        onChange={e => setNuevoPrecio(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                      />
                      <button
                        onClick={() => actualizarPrecio(casa.id)}
                        style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* Editar descripción */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 8 }}>📝 Descripción</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Nueva descripción"
                        value={nuevaDescripcion}
                        onChange={e => setNuevaDescripcion(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                      />
                      <button
                        onClick={() => actualizarDescripcion(casa.id)}
                        style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* Gestionar reglas */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 8 }}>📜 Reglas</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {casa.reglas?.map((regla, idx) => (
                        <span key={idx} style={{ backgroundColor: '#fef3c7', padding: '6px 12px', borderRadius: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {regla}
                          <button onClick={() => eliminarRegla(casa.id, casa.reglas, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Nueva regla..."
                        value={nuevaRegla}
                        onChange={e => setNuevaRegla(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                      />
                      <button
                        onClick={() => agregarRegla(casa.id, casa.reglas || [])}
                        style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Gestionar servicios */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 8 }}>✨ Servicios</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {casa.servicios?.map((servicio, idx) => (
                        <span key={idx} style={{ backgroundColor: '#dbeafe', padding: '6px 12px', borderRadius: 20, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {servicio}
                          <button onClick={() => eliminarServicio(casa.id, casa.servicios, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Nuevo servicio..."
                        value={nuevoServicio}
                        onChange={e => setNuevoServicio(e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #d1d5db' }}
                      />
                      <button
                        onClick={() => agregarServicio(casa.id, casa.servicios || [])}
                        style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Calendario de fechas bloqueadas */}
                  <div>
                    <label style={{ fontWeight: '600', color: '#92400e', display: 'block', marginBottom: 12 }}>📅 Fechas bloqueadas</label>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <button onClick={mesAnterior} style={{ padding: '8px 16px', backgroundColor: '#fef3c7', border: 'none', borderRadius: 6, cursor: 'pointer' }}>←</button>
                      <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{mesActual.toLocaleString('es-AR', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={mesSiguiente} style={{ padding: '8px 16px', backgroundColor: '#fef3c7', border: 'none', borderRadius: 6, cursor: 'pointer' }}>→</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                      {nombresDias.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#6b7280' }}>{d.slice(0, 3)}</div>)}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                      {generarCalendario().map((item, idx) => (
                        item ? (
                          <button
                            key={idx}
                            onClick={() => !item.esPasado && toggleFechaBloqueada(casa.id, item.fecha)}
                            disabled={item.esPasado}
                            style={{
                              height: 45,
                              border: item.bloqueado ? '2px solid #dc2626' : '1px solid #e5e7eb',
                              borderRadius: 6,
                              backgroundColor: item.bloqueado ? '#fee2e2' : 'white',
                              color: item.bloqueado ? '#dc2626' : item.esPasado ? '#9ca3af' : '#1f2937',
                              cursor: item.esPasado ? 'not-allowed' : 'pointer',
                              fontWeight: item.bloqueado ? '600' : '400',
                              fontSize: 14
                            }}
                          >
                            {item.dia}
                          </button>
                        ) : <div key={idx} style={{ height: 45 }} />
                      ))}
                    </div>
                    
                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                      💡 Tocá un día para bloquearlo (rojo) o desbloquearlo
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Admin