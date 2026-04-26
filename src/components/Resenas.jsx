import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function Resenas({ casaId }) {
  const [resenas, setResenas] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [estrellas, setEstrellas] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    cargarResenas()
  }, [casaId])

  async function cargarResenas() {
    const { data } = await supabase
      .from('resenas')
      .select('*')
      .eq('casa_id', casaId)
      .eq('aprobada', true)
      .order('created_at', { ascending: false })
    if (data) setResenas(data)
  }

  async function enviarResena() {
    if (!nombre.trim()) {
      alert('Por favor, poné tu nombre')
      return
    }
    
    await supabase.from('resenas').insert({
      casa_id: casaId,
      nombre_cliente: nombre,
      estrellas: estrellas,
      comentario: comentario
    })
    
    setEnviado(true)
    setNombre('')
    setComentario('')
    setEstrellas(5)
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⭐ Reseñas ({resenas.length})
      </h3>

      {/* Lista de reseñas */}
      {resenas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {resenas.map(r => (
            <div key={r.id} style={{ backgroundColor: '#fef7ed', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{r.nombre_cliente}</span>
                <span style={{ color: '#d97706', fontSize: '14px' }}>
                  {'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}
                </span>
              </div>
              {r.comentario && <p style={{ fontSize: '13px', color: '#4b5563', fontStyle: 'italic' }}>"{r.comentario}"</p>}
            </div>
          ))}
        </div>
      )}

      {/* Formulario para dejar reseña */}
      {!mostrarForm && !enviado && (
        <button
          onClick={() => setMostrarForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            border: '2px solid #d97706',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          ✍️ Dejar una reseña
        </button>
      )}

      {enviado && (
        <div style={{ backgroundColor: '#d1fae5', padding: '12px', borderRadius: '8px', color: '#065f46', fontSize: '14px' }}>
          ✅ ¡Gracias por tu reseña! Será visible cuando el administrador la apruebe.
        </div>
      )}

      {mostrarForm && !enviado && (
        <div style={{ backgroundColor: '#fef7ed', padding: '20px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '12px' }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Puntuación:</span>
            {[1, 2, 3, 4, 5].map(e => (
              <button
                key={e}
                onClick={() => setEstrellas(e)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  color: e <= estrellas ? '#d97706' : '#d1d5db'
                }}
              >
                ★
              </button>
            ))}
          </div>
          
          <textarea
            placeholder="Tu comentario (opcional)"
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '12px', resize: 'vertical' }}
          />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={enviarResena}
              style={{ padding: '10px 20px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Enviar reseña
            </button>
            <button
              onClick={() => setMostrarForm(false)}
              style={{ padding: '10px 20px', backgroundColor: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Resenas