import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import DetalleCasa from './pages/DetalleCasa.jsx'
import Admin from './pages/Admin.jsx'
import ClienteReserva from './pages/ClienteReserva'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casa/:id" element={<DetalleCasa />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reserva/:codigo" element={<ClienteReserva />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App