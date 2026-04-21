import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DetalleCasa from './pages/DetalleCasa'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/casa/:id" element={<DetalleCasa />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App