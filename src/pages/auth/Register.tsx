import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuthContext } from '../../AuthContext/AuthContext'
import { z } from 'zod'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export function Register() {
  const { login, user } = useAuthContext()
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const validationSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Please provide a valid email address."),
    password: z.string().min(6, "Your password needs to be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<any>(null);

  useEffect(() => {
    if (user) { 
      navigate("/");
      return;
    }
  }, [user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFormValues = { ...formValues, [e.target.name]: e.target.value };
    setFormValues(newFormValues);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dataAsObject = { ...formValues };
    const validationResult = validationSchema.safeParse(dataAsObject);
    
    if (!validationResult.success) {
      const fieldErrors: any = {};
      validationResult.error.issues.forEach((error: any) => {
        const path = error.path[0] as string;
        if (path) {
          fieldErrors[path] = [error.message];
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors(null);

    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        body: JSON.stringify({
          firstName: dataAsObject.firstName,
          lastName: dataAsObject.lastName,
          email: dataAsObject.email,
          password: dataAsObject.password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400) {
          if (typeof data === "string") {
            toast.error(data);
          }
        }
        throw new Error(data.message || 'Registration failed');
      }

      login(data);
      navigate("/");
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  }

  // Don't render the register form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Marketplace
          </h1>
          <h2 className="text-xl font-medium text-[#a1a1aa]">
            Create your account
          </h2>
        </div>

        {/* Register Form */}
        <div className="bg-[#18181b] rounded-lg shadow-xl p-8 border border-[#27272a]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-colors"
                  placeholder="First name"
                />
                {errors?.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-colors"
                  placeholder="Last name"
                />
                {errors?.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName[0]}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formValues.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
              {errors?.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formValues.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-[#8b5cf6] transition-colors cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {errors?.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-[#3f3f46] rounded-md text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
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

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#8b5cf6] focus:ring-[#8b5cf6] border-[#3f3f46] rounded bg-[#0a0a0a]"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-[#a1a1aa]">
                I agree to the{' '}
                <a href="#" className="font-medium text-[#8b5cf6] hover:text-[#a855f7] transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-[#8b5cf6] hover:text-[#a855f7] transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
              >
                Create account
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3f3f46]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#18181b] text-[#71717a]">Or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-[#3f3f46] rounded-md shadow-sm bg-[#0a0a0a] text-sm font-medium text-white hover:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-colors cursor-pointer"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="ml-2">Google</span>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-[#3f3f46] rounded-md shadow-sm bg-[#0a0a0a] text-sm font-medium text-white hover:bg-[#18181b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-colors cursor-pointer"
              >
                <FaFacebook className="w-5 h-5 text-blue-600" />
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-[#a1a1aa]">
            Already have an account?{' '}
            <a href="#" className="font-medium text-[#8b5cf6] hover:text-[#a855f7] transition-colors" onClick={() => navigate('/login')}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
