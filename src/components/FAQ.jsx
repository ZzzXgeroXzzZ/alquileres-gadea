import { useState } from 'react'

function FAQ() {
  const [preguntaAbierta, setPreguntaAbierta] = useState(null)

  const preguntas = [
    {
      id: 1,
      pregunta: '🕐 ¿A qué hora es el check-in y check-out?',
      respuesta: 'El check-in es a partir de las 14:00 hs y el check-out es hasta las 10:00 hs. Si necesitás otro horario, consultanos por WhatsApp y se tratará de acomodar según disponibilidad.'
    },
    {
      id: 2,
      pregunta: '🐕 ¿Se aceptan mascotas?',
      respuesta: 'Depende de la propiedad. En la sección "Reglas de la casa" de cada alojamiento vas a encontrar si acepta mascotas y si tiene algún cargo extra.'
    },
    {
      id: 3,
      pregunta: '💰 ¿Cómo confirmo mi reserva?',
      respuesta: 'Seleccioná las fechas en el calendario y hacé clic en "Reservar por WhatsApp". Te contactaremos para confirmar disponibilidad, precio final y coordinar el pago.'
    },
    {
      id: 4,
      pregunta: '💵 ¿Hay que dejar seña?',
      respuesta: 'Sí, para confirmar la reserva solicitamos una seña del 30% del total. El resto se abona al momento del check-in.'
    },
    {
      id: 5,
      pregunta: '🧹 ¿Incluye limpieza?',
      respuesta: 'Sí, todas las propiedades se entregan limpias.'
    },
    {
      id: 6,
      pregunta: '📶 ¿Hay WiFi en todas las casas?',
      respuesta: 'En la sección "Servicios incluidos" de cada casa vas a encontrar todos los detalles.'
    },
    {
      id: 7,
      pregunta: '🚗 ¿Hay estacionamiento?',
      respuesta: 'La mayoría de nuestras propiedades cuentan con estacionamiento Revisá la sección "Servicios incluidos" de cada casa para confirmar.'
    }
  ]

  const togglePregunta = (id) => {
    setPreguntaAbierta(preguntaAbierta === id ? null : id)
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '0 16px'
    }}>
      {/* Encabezado tipo chat */}
      <div style={{
        backgroundColor: '#d97706',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '28px' }}>💬</span>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>¿Tenés dudas?</h3>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Preguntas frecuentes</p>
        </div>
      </div>

      {/* Lista de preguntas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0 0 12px 12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {preguntas.map((item, index) => (
          <div 
            key={item.id}
            style={{
              borderBottom: index < preguntas.length - 1 ? '1px solid #fef3c7' : 'none'
            }}
          >
            {/* Pregunta (clickeable) */}
            <button
              onClick={() => togglePregunta(item.id)}
              style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: preguntaAbierta === item.id ? '#fef7ed' : 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (preguntaAbierta !== item.id) {
                  e.currentTarget.style.backgroundColor = '#fef7ed'
                }
              }}
              onMouseLeave={(e) => {
                if (preguntaAbierta !== item.id) {
                  e.currentTarget.style.backgroundColor = 'white'
                }
              }}
            >
              <span style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#1f2937'
              }}>
                {item.pregunta}
              </span>
              <span style={{
                fontSize: '20px',
                color: '#d97706',
                transform: preguntaAbierta === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}>
                ▼
              </span>
            </button>

            {/* Respuesta (desplegable) */}
            <div style={{
              maxHeight: preguntaAbierta === item.id ? '200px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease-in-out',
              backgroundColor: '#fef7ed'
            }}>
              <p style={{
                padding: preguntaAbierta === item.id ? '0 20px 16px 20px' : '0 20px',
                fontSize: '14px',
                color: '#4b5563',
                lineHeight: '1.6'
              }}>
                {item.respuesta}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje final tipo chat */}
      <div style={{
        marginTop: '16px',
        padding: '12px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '20px' }}>💭</span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          ¿No encontraste lo que buscabas?
        </span>
        <a
          href="https://wa.me/2494320917"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            backgroundColor: '#25D366',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          📱 Escribinos por WhatsApp
        </a>
      </div>
    </div>
  )
}

export default FAQ