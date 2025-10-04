'use client'

/**
 * Verify Email Page - Neo-Minimalist Design
 * Shows after user signs up with email, prompting them to check their inbox
 */

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { authWithEmail } from '@/lib/auth/auth-helpers'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResendEmail = async () => {
    setResending(true)
    setResent(false)
    setError(null)

    try {
      const result = await authWithEmail.resendVerificationEmail(email)

      if (result.success) {
        setResent(true)
      } else {
        setError(result.error || 'Failed to resend email')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h1>
              <p className="text-gray-500 text-sm">
                We sent a verification link to
              </p>
              <p className="text-indigo-600 font-medium mt-1">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2">
              <p className="text-sm text-gray-700 font-medium">
                What to do next:
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Open the email from Unsubscribr</li>
                <li>Click the verification link</li>
                <li>You&apos;ll be redirected to your dashboard</li>
              </ol>
            </div>

            {/* Resend Email */}
            <div className="pt-4 border-t border-gray-200">
              {error && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-600 mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              {resent ? (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verification email sent!</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Didn&apos;t receive the email?{' '}
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                  >
                    {resending ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Resend'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Back to Login */}
            <div className="pt-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 hover:bg-gray-50 rounded-xl font-medium"
                >
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Check your spam folder if you don&apos;t see the email within a few minutes
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
