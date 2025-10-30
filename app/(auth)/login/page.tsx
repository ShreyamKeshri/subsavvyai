'use client'

/**
 * Login Page - Modern Clean Design
 * Email/Password and Google OAuth authentication
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { authWithGoogle, authWithEmail } from '@/lib/auth/auth-helpers'
import { branding } from '@/lib/config/branding'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  // Basic email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Form validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle email sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await authWithEmail.signIn(email, password)

      if (!result.success) {
        setErrors({ general: result.error || 'Failed to sign in' })
        setIsLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Something went wrong' })
      setIsLoading(false)
    }
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const result = await authWithGoogle.signIn()
      if (!result.success) {
        setErrors({ general: result.error || 'Failed to sign in with Google' })
        setIsLoading(false)
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Something went wrong' })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-12">
      {/* Background gradient accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgb(37 99 235) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgb(6 182 212) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl bg-white">
        <div className="px-12 py-10 space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-bold text-blue-600">{branding.name}</h1>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 border border-gray-300 hover:bg-gray-50 font-medium text-sm rounded-lg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 uppercase tracking-wider font-medium">
                Or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-900 block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                disabled={isLoading}
                className={`h-12 text-sm rounded-lg ${
                  errors.email
                    ? 'border-2 border-orange-500 bg-white focus:ring-orange-500'
                    : 'bg-gray-50 border-0'
                }`}
                autoComplete="email"
              />
              {errors.email && (
                <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-500 rounded text-xs text-orange-900">
                  <span className="font-semibold">⚠</span>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-gray-900 block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  disabled={isLoading}
                  className={`h-12 text-sm rounded-lg pr-10 ${
                    errors.password
                      ? 'border-2 border-orange-500 bg-white focus:ring-orange-500'
                      : 'bg-gray-50 border-0'
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-500 rounded text-xs text-orange-900">
                  <span className="font-semibold">⚠</span>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <Link
              href="/forgot-password"
              className="inline-block text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Forgot password?
            </Link>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full h-12 text-sm mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </Card>

      <div className="w-full max-w-md mt-8 space-y-6 text-center relative z-10">
        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/legal/refund" className="text-gray-600 hover:text-gray-900 transition-colors">
            Refund & Cancellation
          </Link>
        </div>
      </div>
    </div>
  )
}
