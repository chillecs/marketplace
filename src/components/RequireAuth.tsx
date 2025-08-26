import { useAuthContext } from '../AuthContext/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) {
    return null // Don't render anything while redirecting
  }

  return <>{children}</>
}
