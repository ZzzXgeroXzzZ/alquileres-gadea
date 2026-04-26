import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

function Estadisticas() {
  const [datosOcupacion, setDatosOcupacion] = useState(null)
  const [datosConsultas, setDatosConsultas] = useState(null)
  const [datosIngresos, setDatosIngresos] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  async function cargarEstadisticas() {
    setLoading(true)

    // 1. Cargar fechas bloqueadas para ocupación
    const { data: fechas } = await supabase.from('fechas_bloqueadas').select('fecha')
    const { data: casas } = await supabase.from('casas').select('id, nombre')
    
    if (fechas && casas) {
      // Ocupación por mes
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const ocupacionPorMes = Array(12).fill(0)
      
      fechas.forEach(f => {
        const mes = new Date(f.fecha).getMonth()
        ocupacionPorMes[mes]++
      })

      setDatosOcupacion({
        labels: meses,
        datasets: [{
          label: 'Días ocupados',
          data: ocupacionPorMes,
          backgroundColor: '#d97706',
          borderRadius: 8
        }]
      })
    }

    // 2. Cargar consultas confirmadas para ingresos
    const { data: consultas } = await supabase
      .from('consultas')
      .select('casa_nombre, precio_final, estado')
      .eq('estado', 'Confirmada')

    if (consultas) {
      // Ingresos por casa
      const ingresosPorCasa = {}
      consultas.forEach(c => {
        if (c.precio_final) {
          ingresosPorCasa[c.casa_nombre] = (ingresosPorCasa[c.casa_nombre] || 0) + c.precio_final
        }
      })

      const nombres = Object.keys(ingresosPorCasa)
      const ingresos = Object.values(ingresosPorCasa)

      setDatosIngresos({
        labels: nombres,
        datasets: [{
          label: 'Ingresos ($)',
          data: ingresos,
          backgroundColor: ['#d97706', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b'],
          borderRadius: 8
        }]
      })

      // Consultas por casa
      const consultasPorCasa = {}
      consultas.forEach(c => {
        consultasPorCasa[c.casa_nombre] = (consultasPorCasa[c.casa_nombre] || 0) + 1
      })

      setDatosConsultas({
        labels: Object.keys(consultasPorCasa),
        datasets: [{
          label: 'Consultas',
          data: Object.values(consultasPorCasa),
          backgroundColor: ['#d97706', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b'],
          borderRadius: 8
        }]
      })
    }

    setLoading(false)
  }

  if (loading) return <p style={{ textAlign: 'center', padding: 40, color: '#92400e' }}>Cargando estadísticas...</p>

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 22, color: '#92400e', marginBottom: 24 }}>📊 Estadísticas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* Ocupación por mes */}
        <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: '600', color: '#92400e', marginBottom: 16 }}>📅 Días ocupados por mes</h3>
          {datosOcupacion && <Bar data={datosOcupacion} options={{ responsive: true, plugins: { legend: { display: false } } }} />}
        </div>

        {/* Ingresos por casa */}
        <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: '600', color: '#92400e', marginBottom: 16 }}>💰 Ingresos por propiedad</h3>
          {datosIngresos && datosIngresos.labels.length > 0 ? (
            <Bar data={datosIngresos} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Sin datos de ingresos todavía</p>
          )}
        </div>

        {/* Consultas por casa */}
        <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: '600', color: '#92400e', marginBottom: 16 }}>🏠 Consultas por propiedad</h3>
          {datosConsultas && datosConsultas.labels.length > 0 ? (
            <Doughnut data={datosConsultas} options={{ responsive: true }} />
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>Sin datos de consultas todavía</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Estadisticas