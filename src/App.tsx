import './index.css'
import { Login } from './pages/auth/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Register } from './pages/auth/Register'

export function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
