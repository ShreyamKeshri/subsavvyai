/**
 * Razorpay Webhook Handler
 * Processes payment events from Razorpay
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/payments/razorpay-server'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret)

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the event
    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    console.log('[Razorpay Webhook] Event received:', eventType)

    const supabase = await createClient()

    // Handle different event types
    switch (eventType) {
      case 'payment.captured': {
        // Payment was successfully captured
        const payment = payload.payment.entity
        const orderId = payment.order_id
        const paymentId = payment.id
        const amount = payment.amount / 100 // Convert from paise to rupees

        console.log('[Razorpay Webhook] Payment captured:', { orderId, paymentId, amount })

        // Update transaction in database
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            razorpay_payment_id: paymentId,
            status: 'captured',
            payment_method: payment.method,
            completed_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', orderId)

        if (updateError) {
          console.error('[Razorpay Webhook] Error updating transaction:', updateError)
        }

        break
      }

      case 'payment.failed': {
        // Payment failed
        const payment = payload.payment.entity
        const orderId = payment.order_id
        const paymentId = payment.id
        const errorCode = payment.error_code
        const errorDescription = payment.error_description

        console.log('[Razorpay Webhook] Payment failed:', {
          orderId,
          paymentId,
          errorCode,
          errorDescription,
        })

        // Update transaction status
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            razorpay_payment_id: paymentId,
            status: 'failed',
            error_code: errorCode,
            error_description: errorDescription,
          })
          .eq('razorpay_order_id', orderId)

        if (updateError) {
          console.error('[Razorpay Webhook] Error updating transaction:', updateError)
        }

        break
      }

      case 'order.paid': {
        // Order was paid (alternative to payment.captured)
        const order = payload.order.entity
        const orderId = order.id
        const amount = order.amount / 100

        console.log('[Razorpay Webhook] Order paid:', { orderId, amount })

        // This is usually followed by payment.captured, so we can skip processing
        // to avoid duplicate updates
        break
      }

      case 'payment.authorized': {
        // Payment was authorized (not yet captured)
        const payment = payload.payment.entity
        const orderId = payment.order_id
        const paymentId = payment.id

        console.log('[Razorpay Webhook] Payment authorized:', { orderId, paymentId })

        // Update transaction status to authorized
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            razorpay_payment_id: paymentId,
            status: 'authorized',
          })
          .eq('razorpay_order_id', orderId)

        if (updateError) {
          console.error('[Razorpay Webhook] Error updating transaction:', updateError)
        }

        break
      }

      case 'refund.processed': {
        // Refund was processed (only handle final refund, not refund.created)
        const refund = payload.refund.entity
        const paymentId = refund.payment_id
        const amount = refund.amount / 100

        console.log('[Razorpay Webhook] Refund processed:', { paymentId, amount })

        // Fetch transaction with status to validate state
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('user_id, status')
          .eq('razorpay_payment_id', paymentId)
          .single()

        if (!transaction) {
          console.error('[Razorpay Webhook] Transaction not found for refund')
          break
        }

        // Only process if transaction was previously captured (prevent duplicate processing)
        if (transaction.status === 'refunded') {
          console.log('[Razorpay Webhook] Refund already processed')
          break
        }

        if (transaction.status !== 'captured') {
          console.log('[Razorpay Webhook] Skipping downgrade - transaction not in valid state:', transaction.status)
          break
        }

        // Update transaction status to refunded
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            status: 'refunded',
          })
          .eq('razorpay_payment_id', paymentId)

        if (updateError) {
          console.error('[Razorpay Webhook] Error updating transaction:', updateError)
          break
        }

        // Downgrade user tier
        await supabase
          .from('profiles')
          .update({
            tier: 'free',
            trial_ends_at: null,
            subscription_started_at: null,
            subscription_ends_at: null,
          })
          .eq('id', transaction.user_id)

        break
      }

      default:
        console.log('[Razorpay Webhook] Unhandled event type:', eventType)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Razorpay Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
