import { useState } from 'react'

function Carrusel({ fotos }) {
  const [indiceActual, setIndiceActual] = useState(0)

  if (!fotos || fotos.length === 0) {
    return (
      <div style={{ 
        width: '100%', 
        height: '300px', 
        backgroundColor: '#e5e7eb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px'
      }}>
        <span style={{ color: '#6b7280' }}>📷 Sin fotos</span>
      </div>
    )
  }

  const siguiente = () => {
    setIndiceActual((indiceActual + 1) % fotos.length)
  }

  const anterior = () => {
    setIndiceActual((indiceActual - 1 + fotos.length) % fotos.length)
  }

  const irAIndice = (indice) => {
    setIndiceActual(indice)
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Imagen principal */}
      <div style={{ 
        width: '100%', 
        height: '300px', 
        overflow: 'hidden', 
        borderRadius: '8px',
        position: 'relative'
      }}>
        <img 
          src={fotos[indiceActual]} 
          alt={`Foto ${indiceActual + 1}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'opacity 0.3s'
          }}
        />

        {/* Contador de fotos */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {indiceActual + 1} / {fotos.length}
        </div>
      </div>

      {/* Flechas de navegación (solo si hay más de 1 foto) */}
      {fotos.length > 1 && (
        <>
          <button
            onClick={anterior}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#d97706',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef3c7'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            }}
          >
            ←
          </button>

          <button
            onClick={siguiente}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#d97706',
              transition: 'all 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef3c7'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
            }}
          >
            →
          </button>
        </>
      )}

      {/* Puntitos indicadores */}
      {fotos.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '12px'
        }}>
          {fotos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => irAIndice(idx)}
              style={{
                width: idx === indiceActual ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === indiceActual ? '#d97706' : '#d1d5db',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                padding: 0
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carrusel