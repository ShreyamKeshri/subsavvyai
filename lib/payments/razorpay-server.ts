/**
 * Razorpay Server Client
 * Server-side Razorpay SDK initialization and utilities
 */

import crypto from 'crypto'
import Razorpay from 'razorpay'
import { razorpayConfig } from './razorpay-config'

// Initialize Razorpay instance (singleton)
let razorpayInstance: Razorpay | null = null

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    razorpayInstance = new Razorpay({
      key_id: razorpayConfig.keyId,
      key_secret: razorpayConfig.keySecret,
    })
  }

  return razorpayInstance
}

// Helper to verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying payment signature:', error)
    return false
  }
}

// Helper to verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}
