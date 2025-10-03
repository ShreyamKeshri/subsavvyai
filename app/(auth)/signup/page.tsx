'use client'

/**
 * Sign Up Page - Neo-Minimalist Design
 * Multi-method authentication: Phone OTP (Primary), Google OAuth (Secondary), Email/Password (Tertiary)
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { authWithPhone, authWithGoogle, authWithEmail, validatePhoneNumber, validateEmail, validatePassword } from '@/lib/auth/auth-helpers'
import { Loader2, Mail as MailIcon } from 'lucide-react'

type SignUpMethod = 'phone' | 'google' | 'email'

export default function SignUpPage() {
  const router = useRouter()
  const [method, setMethod] = useState<SignUpMethod>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  // Email/Password state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handlePhoneSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      if (!otpSent) {
        // Step 1: Send OTP
        const validation = validatePhoneNumber(phoneNumber)
        if (!validation.valid) {
          setError(validation.message || 'Invalid phone number')
          setLoading(false)
          return
        }

        const result = await authWithPhone.sendOTP(phoneNumber)
        if (!result.success) {
          setError(result.error || 'Failed to send OTP')
          setLoading(false)
          return
        }

        setOtpSent(true)
        setError(null)
      } else {
        // Step 2: Verify OTP
        if (otp.length !== 6) {
          setError('Please enter the 6-digit OTP')
          setLoading(false)
          return
        }

        const result = await authWithPhone.verifyOTP(phoneNumber, otp)
        if (!result.success) {
          setError(result.error || 'Invalid OTP')
          setLoading(false)
          return
        }

        // Success! Redirect to dashboard
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      const result = await authWithGoogle.signIn()
      if (!result.success) {
        setError(result.error || 'Failed to sign in with Google')
        setLoading(false)
      }
      // Will redirect to Google, then back to callback
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const handleEmailSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      // Validate inputs
      const emailValidation = validateEmail(email)
      if (!emailValidation.valid) {
        setError(emailValidation.message || 'Invalid email')
        setLoading(false)
        return
      }

      const passwordValidation = validatePassword(password)
      if (!passwordValidation.valid) {
        setError(passwordValidation.message || 'Weak password')
        setLoading(false)
        return
      }

      const result = await authWithEmail.signUp(email, password, fullName)
      if (!result.success) {
        setError(result.error || 'Failed to sign up')
        setLoading(false)
        return
      }

      if (result.needsVerification) {
        setError(null)
        alert('Check your email to verify your account!')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo/Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
          <MailIcon className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Unsubscribr
          </h1>
          <p className="text-gray-500 text-sm">
            {method === 'phone' && 'Enter your phone number to get started'}
            {method === 'email' && 'Create your account with email'}
            {method === 'google' && 'Sign up with Google'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Phone OTP Form */}
        {method === 'phone' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900 font-medium">
                Phone Number
              </Label>
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-gray-900 font-medium">+91</span>
                </div>

                {/* Phone Input */}
                <input
                  id="phone"
                  type="tel"
                  placeholder="9760051763"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={otpSent}
                  className="flex-1 h-12 px-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
                />
              </div>
              {otpSent && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtp('')
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Change number
                </button>
              )}
            </div>

            {/* OTP Input */}
            {otpSent && (
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-900 font-medium">
                  Enter OTP
                </Label>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="h-12 px-4 border border-gray-200 rounded-xl text-center text-2xl tracking-widest font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-900"
                />
                <p className="text-xs text-gray-500 text-center">
                  OTP sent to +91 {phoneNumber}
                </p>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handlePhoneSignUp}
              disabled={loading || (!otpSent && phoneNumber.length !== 10) || (otpSent && otp.length !== 6)}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {otpSent ? 'Verifying...' : 'Sending OTP...'}
                </>
              ) : (
                otpSent ? 'Verify & Continue' : 'Continue'
              )}
            </button>
          </div>
        )}

        {/* Email/Password Form */}
        {method === 'email' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900 font-medium">
                Full Name
              </Label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 px-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-medium">
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                Password
              </Label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 px-4 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-900"
              />
              <p className="text-xs text-gray-500">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <button
              onClick={handleEmailSignUp}
              disabled={loading || !email || !password}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Back to Phone */}
            <button
              onClick={() => setMethod('phone')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to phone sign up
            </button>
          </div>
        )}

        {/* Show divider and Google button only on phone method */}
        {method === 'phone' && (
          <>
            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 uppercase tracking-wider text-xs font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full h-12 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-gray-900"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
              )}
              Continue with Google
            </button>

            {/* Email Link */}
            <button
              onClick={() => setMethod('email')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium mt-4"
            >
              or sign up with email →
            </button>
          </>
        )}

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-gray-700 hover:text-gray-900 font-medium">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-gray-700 hover:text-gray-900 font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Log in
        </Link>
      </p>
    </div>
  )
}
