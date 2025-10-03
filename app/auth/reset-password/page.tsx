'use client'

/**
 * Reset Password Page - Neo-Minimalist Design
 * Password reset form for users who clicked the email link
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authWithEmail, validatePassword } from '@/lib/auth/auth-helpers'
import { Loader2, Mail as MailIcon, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    // Check if we have the required tokens from the email link
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    if (!accessToken || !refreshToken) {
      setTokenError(true)
    }
  }, [searchParams])

  const handleResetPassword = async () => {
    setError(null)
    setLoading(true)

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Validate password strength
      const validation = validatePassword(password)
      if (!validation.valid) {
        setError(validation.message || 'Weak password')
        setLoading(false)
        return
      }

      const result = await authWithEmail.updatePassword(password)
      if (!result.success) {
        setError(result.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MailIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {tokenError ? (
            <>
              {/* Invalid/Expired Token */}
              <div className="text-center space-y-6 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Invalid reset link
                  </h1>
                  <p className="text-gray-500 text-sm">
                    This password reset link is invalid or has expired
                  </p>
                </div>

                <Link href="/auth/forgot-password">
                  <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all">
                    Request a new link
                  </Button>
                </Link>

                <Link
                  href="/login"
                  className="inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          ) : success ? (
            <>
              {/* Success State */}
              <div className="text-center space-y-6 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Password reset successful
                  </h1>
                  <p className="text-gray-500 text-sm">
                    Redirecting you to login...
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Reset Form */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Set new password
                </h1>
                <p className="text-gray-500 text-sm">
                  Choose a strong password for your account
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Password Inputs */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 font-medium">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500">
                    At least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900 font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={loading || !password || !confirmPassword}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
