'use client'

/**
 * Forgot Password Page - Neo-Minimalist Design
 * Password reset request for email users
 */

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authWithEmail, validateEmail } from '@/lib/auth/auth-helpers'
import { Loader2, Mail as MailIcon, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async () => {
    setError(null)
    setLoading(true)

    try {
      // Validate email
      const validation = validateEmail(email)
      if (!validation.valid) {
        setError(validation.message || 'Invalid email')
        setLoading(false)
        return
      }

      const result = await authWithEmail.resetPassword(email)
      if (!result.success) {
        setError(result.error || 'Failed to send reset email')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
          {!success ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot your password?
                </h1>
                <p className="text-gray-500 text-sm">
                  No worries, we&apos;ll send you reset instructions
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleResetPassword}
                  disabled={loading || !email}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
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
          ) : (
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
                    Check your email
                  </h1>
                  <p className="text-gray-500 text-sm">
                    We&apos;ve sent password reset instructions to
                  </p>
                  <p className="text-gray-900 font-medium text-sm mt-1">
                    {email}
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl">
                  <p className="text-sm text-indigo-700">
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setSuccess(false)}
                      className="font-medium underline hover:no-underline"
                    >
                      try again
                    </button>
                  </p>
                </div>

                <Link
                  href="/login"
                  className="inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium"
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
