import { useState } from 'react'
import { useAuthContext } from '../AuthContext/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash, FaEdit, FaTrash, FaSave } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { z } from 'zod'

export function Profile() {
  const { user, accessToken, login, logout } = useAuthContext()
  const navigate = useNavigate()
  const [isEditingFirstName, setIsEditingFirstName] = useState(false)
  const [isEditingLastName, setIsEditingLastName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const apiUrl = import.meta.env.VITE_API_URL

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<any>(null)

  const emailSchema = z.object({
    email: z.email("Please provide a valid email address."),
  })

  const passwordSchema = z.object({
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateFirstName = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ firstName: formData.firstName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update first name')
      }

      // Update user context with new data
      login({ user: { ...user!, firstName: formData.firstName }, accessToken })
      toast.success('First name updated successfully!')
      setIsEditingFirstName(false)
      setErrors(null)
      console.log(accessToken)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update first name')
    }
  }

  const handleUpdateLastName = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ lastName: formData.lastName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update last name')
      }

      // Update user context with new data
      login({ user: { ...user!, lastName: formData.lastName }, accessToken })
      toast.success('Last name updated successfully!')
      setIsEditingLastName(false)
      setErrors(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update last name')
    }
  }

  const handleUpdateEmail = async () => {
    const validation = emailSchema.safeParse({ email: formData.email })
    
    if (!validation.success) {
      setErrors({ email: [validation.error.issues[0].message] })
      return
    }

    try {
      const response = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update email')
      }

      // Update user context with new email
      login({ user: { ...user!, email: formData.email }, accessToken })
      toast.success('Email updated successfully!')
      setIsEditingEmail(false)
      setErrors(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email')
    }
  }

  const handleUpdatePassword = async () => {
    const validation = passwordSchema.safeParse(formData)
    
    if (!validation.success) {
      const fieldErrors: any = {}
      validation.error.issues.forEach((error: any) => {
        const path = error.path[0] as string
        if (path) {
          fieldErrors[path] = [error.message]
        }
      })
      setErrors(fieldErrors)
      return
    }

    try {
      const response = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          password: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password')
      }

      toast.success('Password updated successfully!')
      setFormData(prev => ({ 
        ...prev, 
        newPassword: '', 
        confirmPassword: '' 
      }))
      setErrors(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      logout()
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-[#18181b] rounded-lg shadow-xl p-8 border border-[#27272a]">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Profile Settings
          </h1>

          {/* User Information Display */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            <div className="space-y-4">
              {/* First Name Section */}
              <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-lg">
                <div>
                  <p className="text-[#a1a1aa] text-sm">First Name</p>
                  <p className="text-white font-medium">{user.firstName || 'Not set'}</p>
                  {isEditingFirstName && (
                    <div className="flex items-center gap-6 mt-3">
                    <input className="px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                    />
                    <button
                      onClick={handleUpdateFirstName}
                      className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
                    >
                      <FaSave className="w-4 h-4" />
                      Save
                    </button>
                    <p className="text-[#a1a1aa] text-sm cursor-pointer" onClick={() => setIsEditingFirstName(false)}>Cancel</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingFirstName(!isEditingFirstName)}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
              </div>
              {/* Last Name Section */}
              <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-lg">
                <div>
                  <p className="text-[#a1a1aa] text-sm">Last Name</p>
                  <p className="text-white font-medium">{user.lastName || 'Not set'}</p>
                  {isEditingLastName && (
                    <div className="flex items-center gap-6 mt-3">
                    <input className="px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                    />
                    <button
                      onClick={handleUpdateLastName}
                      className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
                    >
                      <FaSave className="w-4 h-4" />
                      Save
                    </button>
                    <p className="text-[#a1a1aa] text-sm cursor-pointer" onClick={() => setIsEditingLastName(false)}>Cancel</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingLastName(!isEditingLastName)}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
              </div>
              {/* Email Section */}
              <div className="flex justify-between items-center p-4 bg-[#0a0a0a] rounded-lg">
                <div>
                  <p className="text-[#a1a1aa] text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                  {isEditingEmail && (
                    <div className="flex items-center gap-6 mt-3">
                      <input className="px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                      />
                      <button
                        onClick={handleUpdateEmail}
                        className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
                      >
                        <FaSave className="w-4 h-4" />
                        Save
                      </button>
                      <p className="text-[#a1a1aa] text-sm cursor-pointer" onClick={() => setIsEditingEmail(false)}>Cancel</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>

          {/* Update Password Section */}
          <div className="mb-8 p-6 bg-[#0a0a0a] rounded-lg border border-[#3f3f46]">
            <h3 className="text-lg font-semibold text-white mb-4">Update Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-[#18181b] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-[#8b5cf6] transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors?.newPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.newPassword[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-[#18181b] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-[#8b5cf6] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors?.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword[0]}</p>
                )}
              </div>
              <button
                onClick={handleUpdatePassword}
                className="w-full py-3 px-4 text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="p-6 bg-red-900/20 rounded-lg border border-red-500/30">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
            <p className="text-[#a1a1aa] mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
              >
                <FaTrash className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-400 text-sm">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <FaTrash className="w-4 h-4" />
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3 px-4 text-sm font-medium rounded-md text-white bg-[#3f3f46] hover:bg-[#52525b] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
