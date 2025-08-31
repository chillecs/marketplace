import './index.css'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthContextProvider } from './AuthContext/AuthContext'
import { RequireAuth } from './AuthContext/RequireAuth'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { NavBar } from './components/NavBar'
import { UserProducts } from './pages/UserProducts'
import { ProductDetails } from './pages/ProductDetails'

export function App() {
  return (
    <>
      <BrowserRouter>
        <AuthContextProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            } />
            <Route path="/profile" element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            } />
            <Route path="/your-products/:id" element={
              <RequireAuth>
                <UserProducts />
              </RequireAuth>
            } />
            <Route path="/product/:id" element={
              <RequireAuth>
                <ProductDetails />
              </RequireAuth>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthContextProvider>
      </BrowserRouter>
    </>
  )
}
