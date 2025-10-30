'use client'

/**
 * Razorpay Script Loader Hook
 * Dynamically loads Razorpay checkout script
 */

import { useEffect, useState } from 'react'

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  image: string
  order_id: string
  prefill: {
    email: string
    name: string
  }
  theme: {
    color: string
  }
  handler: (response: RazorpayResponse) => void
  modal: {
    ondismiss: () => void
  }
}

export interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface RazorpayPaymentFailedResponse {
  error: {
    code: string
    description: string
    source: string
    step: string
    reason: string
  }
}

export interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', handler: (response: RazorpayPaymentFailedResponse) => void) => void
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance

declare global {
  interface Window {
    Razorpay: RazorpayConstructor | undefined
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setIsLoaded(true)
      return
    }

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true

    script.onload = () => {
      setIsLoaded(true)
    }

    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      setIsLoaded(false)
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup: remove script on unmount
      document.body.removeChild(script)
    }
  }, [])

  return { isLoaded, Razorpay: window.Razorpay }
}
