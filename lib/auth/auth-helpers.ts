/**
 * Authentication Helper Functions
 * Provides reusable utilities for phone OTP, Google OAuth, and email/password auth
 */

import { createClient } from '@/lib/supabase/client'

export type SignUpMethod = 'google' | 'email'

/**
 * Send welcome email asynchronously (non-blocking)
 */
async function sendWelcomeEmailAsync(email: string, firstName: string) {
  try {
    const { sendWelcomeEmail } = await import('@/lib/email/email-service')
    await sendWelcomeEmail(email, firstName)
  } catch (error) {
    // Log but don't throw - email sending shouldn't block signup
    console.error('Error sending welcome email:', error)
  }
}

export interface SignUpResult {
  success: boolean
  user?: unknown
  error?: string
  needsVerification?: boolean
  method: SignUpMethod
}

export interface LoginResult {
  success: boolean
  user?: unknown
  error?: string
  method: SignUpMethod
}

/**
 * Google OAuth Authentication
 */
export const authWithGoogle = {
  /**
   * Sign in with Google OAuth (includes Gmail scope for auto-detection)
   */
  async signIn(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // Include Gmail scope for seamless subscription auto-detection
          scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly',
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sign in with Google' }
    }
  },

  /**
   * Handle OAuth callback and create profile
   */
  async handleCallback(): Promise<SignUpResult> {
    try {
      const supabase = createClient()

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return {
          success: false,
          error: error?.message || 'No user found',
          method: 'google'
        }
      }

      // Extract profile data from OAuth
      const metadata = user.user_metadata || {}
      const fullName = metadata.full_name || metadata.name

      await createOrUpdateProfile(user.id, {
        full_name: fullName,
        avatar_url: metadata.avatar_url || metadata.picture,
      })

      // Send welcome email for new Google OAuth users (non-blocking)
      if (fullName && user.email) {
        const firstName = fullName.split(' ')[0]
        sendWelcomeEmailAsync(user.email, firstName).catch(error => {
          console.error('Failed to send welcome email:', error)
        })
      }

      return {
        success: true,
        user,
        method: 'google'
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle OAuth callback',
        method: 'google'
      }
    }
  }
}

/**
 * Email/Password Authentication
 */
export const authWithEmail = {
  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<SignUpResult> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`
        }
      })

      if (error) {
        return {
          success: false,
          error: error.message,
          method: 'email'
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'No user returned after sign up',
          method: 'email'
        }
      }

      // Create profile
      await createOrUpdateProfile(data.user.id, {
        full_name: fullName
      })

      // Send welcome email (non-blocking, don't wait for it)
      if (fullName && data.user.email) {
        const firstName = fullName.split(' ')[0]
        sendWelcomeEmailAsync(data.user.email, firstName).catch(error => {
          console.error('Failed to send welcome email:', error)
        })
      }

      return {
        success: true,
        user: data.user,
        needsVerification: !data.user.email_confirmed_at,
        method: 'email'
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign up',
        method: 'email'
      }
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<LoginResult> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return {
          success: false,
          error: error.message,
          method: 'email'
        }
      }

      return {
        success: true,
        user: data.user,
        method: 'email'
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
        method: 'email'
      }
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend verification email'
      }
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' }
    }
  },

  /**
   * Update password (after reset)
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update password' }
    }
  }
}

/**
 * General Auth Utilities
 */
export const auth = {
  /**
   * Sign out current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sign out' }
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      return session
    } catch {
      return null
    }
  },

  /**
   * Get current user
   */
  async getUser() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      return user
    } catch {
      return null
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session
  }
}

/**
 * Profile Management
 */
async function createOrUpdateProfile(
  userId: string,
  data: {
    phone_number?: string
    full_name?: string
    avatar_url?: string
  }
) {
  try {
    const supabase = createClient()

    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existing) {
      // Update existing profile
      await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId)
    } else {
      // Create new profile
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...data
        })
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error)
  }
}

/**
 * Email validation
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' }
  }

  return { valid: true }
}

/**
 * Password validation
 */
export function validatePassword(password: string): {
  valid: boolean
  message?: string
  strength?: 'weak' | 'medium' | 'strong'
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
      strength: 'weak'
    }
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const strengthScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length

  if (strengthScore < 3) {
    return {
      valid: false,
      message: 'Password must include uppercase, lowercase, and numbers',
      strength: 'weak'
    }
  }

  const strength = strengthScore === 4 ? 'strong' : 'medium'

  return { valid: true, strength }
}
