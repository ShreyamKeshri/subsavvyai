'use client'

/**
 * Sign Up Page - Split Screen Design (Rocket Money inspired)
 * Left: Value propositions and branding
 * Right: Sign up form with multi-method authentication
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { authWithPhone, authWithGoogle, authWithEmail, validatePhoneNumber, validateEmail, validatePassword } from '@/lib/auth/auth-helpers'
import { Loader2, CheckCircle, TrendingDown, Bell, Wallet } from 'lucide-react'
import { branding } from '@/lib/config/branding'
import { trackUserSignup } from '@/lib/analytics/events'

type SignUpMethod = 'email' | 'phone' | 'google'

export default function SignUpPage() {
  const router = useRouter()
  const [method, setMethod] = useState<SignUpMethod>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Email/Password state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleEmailSignUp = async () => {
    setError(null)

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
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

      const fullName = `${firstName} ${lastName}`.trim()
      const result = await authWithEmail.signUp(email, password, fullName)

      if (!result.success) {
        setError(result.error || 'Failed to sign up')
        setLoading(false)
        return
      }

      // Track signup event
      const user = result.user as { id: string } | undefined
      if (user?.id) {
        trackUserSignup(user.id, 'email')
      }

      if (result.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSignUp = async () => {
    setError(null)
    setLoading(true)

    try {
      if (!otpSent) {
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

        // Track signup event
        const user = result.user as { id: string } | undefined
        if (user?.id) {
          trackUserSignup(user.id, 'phone')
        }

        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Value Propositions */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <Link href="/" className="inline-block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{branding.name}</span>
            </div>
          </Link>

          {/* Main Headline */}
          <div className="mt-20 max-w-lg">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Easily cancel unwanted subscriptions
            </h1>
            <p className="text-xl text-gray-700 mb-12">
              80% of people save money by using {branding.name} to find and cancel unwanted subscriptions!
            </p>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Track spending effortlessly</h3>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lower bills easily</h3>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Never miss a renewal</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{branding.name}</span>
              </div>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create your {branding.name} Account
            </h2>
            <p className="text-gray-600">
              This account will help you manage all your subscriptions!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email Form (Default) */}
          {method === 'email' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name*</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name*</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password*</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  At least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                  I agree to the{' '}
                  <Link href="/terms" className="text-gray-900 underline">
                    {branding.name} Terms of Service
                  </Link>
                  ,{' '}
                  <Link href="/terms" className="text-gray-900 underline">
                    Terms of Use
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-gray-900 underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button
                onClick={handleEmailSignUp}
                disabled={loading || !firstName || !lastName || !email || !password || !agreedToTerms}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Get started'
                )}
              </Button>
            </div>
          )}

          {/* Phone Form */}
          {method === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-lg">🇮🇳</span>
                    <span className="text-gray-900 font-medium">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9760051763"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    disabled={otpSent}
                    className="flex-1 bg-gray-50"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest bg-gray-50"
                  />
                </div>
              )}

              <Button
                onClick={handlePhoneSignUp}
                disabled={loading || (!otpSent && phoneNumber.length !== 10) || (otpSent && otp.length !== 6)}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {otpSent ? 'Verifying...' : 'Sending OTP...'}
                  </>
                ) : (
                  otpSent ? 'Verify & Continue' : 'Get started'
                )}
              </Button>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-wider text-xs font-medium">
                Or
              </span>
            </div>
          </div>

          {/* Alternative Methods */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignUp}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
            >
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
              Continue with Google
            </Button>

            {method === 'email' && (
              <Button
                onClick={() => {
                  setMethod('phone')
                  setError(null)
                }}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
              >
                Continue with Phone
              </Button>
            )}

            {method === 'phone' && (
              <Button
                onClick={() => {
                  setMethod('email')
                  setError(null)
                }}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-50"
              >
                Continue with Email
              </Button>
            )}
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-8">
            Already have a {branding.name} Account?{' '}
            <Link href="/login" className="text-gray-900 font-semibold underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
