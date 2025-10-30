'use client'

/**
 * Upgrade/Pricing Page
 * Displays pricing tiers and initiates Razorpay checkout
 */

import { useState, useEffect } from 'react'
import { Check, X, ArrowRight, Shield, Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { razorpayConfig } from '@/lib/payments/razorpay-config'
import type { BillingCycle } from '@/lib/payments/razorpay-config'
import { useRazorpay, type RazorpayResponse, type RazorpayPaymentFailedResponse } from '@/hooks/useRazorpay'
import { createPaymentOrder, verifyPaymentAndUpgrade } from '@/lib/payments/payment-actions'
import { useRouter } from 'next/navigation'

// Pricing data from config
const pricingPlans = {
  free: {
    name: razorpayConfig.plans.free.name,
    price: `₹${razorpayConfig.plans.free.price}`,
    period: 'Forever',
    description: 'Perfect for getting started',
    cta: 'Get Started Free',
    highlight: false,
    features: [
      ...razorpayConfig.plans.free.features.map(f => ({ name: f, included: true })),
      { name: 'Unlimited subscriptions', included: false },
      { name: 'AI-powered recommendations', included: false },
      { name: 'Bundle optimizer', included: false },
      { name: 'Cancellation guides', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  pro: {
    name: razorpayConfig.plans.pro.name,
    price: {
      monthly: `₹${razorpayConfig.plans.pro.monthly.price}`,
      yearly: `₹${razorpayConfig.plans.pro.yearly.price}`
    },
    period: { monthly: '/month', yearly: '/year' },
    description: 'For serious savers',
    cta: 'Start Free Trial',
    highlight: true,
    badge: 'Best Value',
    trial: `${razorpayConfig.plans.pro.trialDays}-day free trial`,
    savings: razorpayConfig.plans.pro.yearly.discount,
    features: razorpayConfig.plans.pro.features.map(f => ({ name: f, included: true })),
  },
}

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods through Razorpay: UPI, credit/debit cards, and net banking.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel anytime. No questions asked. Your data is yours to keep.',
  },
  {
    question: 'Is there a refund policy?',
    answer: `During your ${razorpayConfig.plans.pro.trialDays}-day free trial, you can cancel anytime with no charges. After that, we offer a 30-day money-back guarantee.`,
  },
  {
    question: 'How does the 7-day free trial work?',
    answer: 'Start your trial instantly. You\'ll be charged only after the trial period ends. Cancel anytime during the trial with no charges.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes, you can change your plan anytime. Changes take effect immediately.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption and comply with all Indian data protection regulations.',
  },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer',
    text: 'SubSavvyAI helped me save ₹12,000 a year. The AI recommendations are spot on!',
    savings: '₹12,000/year',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Freelancer',
    text: 'Finally, a tool that understands Indian subscriptions. The UPI cancellation guides are a lifesaver.',
    savings: '₹8,500/year',
  },
  {
    name: 'Ananya Patel',
    role: 'Product Manager',
    text: 'The bundle optimizer saved me from paying for overlapping services. Highly recommended!',
    savings: '₹15,000/year',
  },
]

export default function UpgradePage() {
  const router = useRouter()
  const { isLoaded: isRazorpayLoaded, Razorpay } = useRazorpay()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')

  // Get user details on mount
  useEffect(() => {
    async function getUserDetails() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUserEmail(user.email || '')
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()

          setUserName(profile?.name || user.email?.split('@')[0] || '')
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
      }
    }

    getUserDetails()
  }, [])

  const handleUpgrade = async (tier: 'free' | 'pro') => {
    if (tier === 'free') {
      router.push('/dashboard')
      return
    }

    if (!isRazorpayLoaded) {
      toast.error('Payment system is loading. Please try again in a moment.')
      return
    }

    setIsLoading(true)
    try {
      // Step 1: Create payment order
      const orderResult = await createPaymentOrder(tier, billingCycle)

      if (!orderResult.success || !orderResult.data) {
        toast.error(orderResult.error || 'Failed to create payment order')
        return
      }

      const { orderId, amount, currency } = orderResult.data

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: razorpayConfig.keyId,
        amount: amount * 100, // Convert to paise
        currency,
        name: razorpayConfig.options.name,
        description: razorpayConfig.options.description,
        image: razorpayConfig.options.image,
        order_id: orderId,
        prefill: {
          email: userEmail,
          name: userName,
        },
        theme: razorpayConfig.options.theme,
        handler: async function (response: RazorpayResponse) {
          // Step 3: Verify payment and upgrade user
          try {
            const verifyResult = await verifyPaymentAndUpgrade(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            )

            if (verifyResult.success) {
              toast.success('Payment successful! Welcome to Pro! 🎉')
              // Redirect to dashboard
              setTimeout(() => {
                router.push('/dashboard')
              }, 1500)
            } else {
              toast.error(verifyResult.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
            toast.info('Payment cancelled')
          },
        },
      }

      if (!Razorpay) {
        toast.error('Payment system not loaded. Please refresh and try again.')
        setIsLoading(false)
        return
      }

      const rzp = new Razorpay(options)

      rzp.on('payment.failed', function (response: RazorpayPaymentFailedResponse) {
        setIsLoading(false)
        toast.error(`Payment failed: ${response.error.description}`)
      })

      rzp.open()
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to initiate checkout. Please try again.')
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-600">SubSavvyAI</div>
          <Button
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950 bg-transparent"
            onClick={() => window.location.href = '/dashboard'}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Stop Wasting Money on Unused Subscriptions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            AI finds ₹10,000/year hidden in your subscriptions. Start saving today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50,000+</div>
              <p className="text-slate-600 dark:text-slate-400">Users saved money</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">₹5 Cr+</div>
              <p className="text-slate-600 dark:text-slate-400">Saved collectively</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">10,000+</div>
              <p className="text-slate-600 dark:text-slate-400">Recommendations generated</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Billing Toggle */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-900 text-green-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-900 text-green-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  Save 16%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Free Plan */}
            <motion.div variants={itemVariants}>
              <Card className="h-full p-8 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{pricingPlans.free.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{pricingPlans.free.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{pricingPlans.free.price}</span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2">{pricingPlans.free.period}</span>
                </div>
                <Button
                  className="w-full mb-8 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  onClick={() => handleUpgrade('free')}
                  disabled={isLoading}
                >
                  {pricingPlans.free.cta}
                </Button>
                <div className="space-y-4">
                  {pricingPlans.free.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div variants={itemVariants}>
              <Card className="h-full p-8 border-2 border-green-600 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-900 shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  {pricingPlans.pro.badge}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{pricingPlans.pro.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{pricingPlans.pro.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-green-600">
                    {billingCycle === 'monthly' ? pricingPlans.pro.price.monthly : pricingPlans.pro.price.yearly}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 ml-2">
                    {billingCycle === 'monthly' ? pricingPlans.pro.period.monthly : pricingPlans.pro.period.yearly}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 font-semibold mb-6">{pricingPlans.pro.savings}</p>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{pricingPlans.pro.trial}</p>
                <Button
                  className="w-full mb-8 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleUpgrade('pro')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : pricingPlans.pro.cta}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                <div className="space-y-4">
                  {pricingPlans.pro.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Trusted by Indian users
          </h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="p-6 border-slate-200 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 mb-4">&quot;{testimonial.text}&quot;</p>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                    <p className="text-sm font-semibold text-green-600 mt-2">Saved {testimonial.savings}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            {faqs.map((faq, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full text-left p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{faq.question}</h3>
                    <span className={`text-green-600 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                  {expandedFaq === idx && <p className="mt-4 text-slate-600 dark:text-slate-400">{faq.answer}</p>}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Your data is safe with us
          </h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Enterprise Security</h3>
              <p className="text-slate-600 dark:text-slate-400">Bank-level encryption for all your data</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <Lock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Privacy First</h3>
              <p className="text-slate-600 dark:text-slate-400">We never sell your data. Ever.</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">GDPR Compliant</h3>
              <p className="text-slate-600 dark:text-slate-400">Compliant with Indian data protection laws</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Ready to save ₹10,000/year?</h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Join thousands of Indians who are already saving money with SubSavvyAI
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            onClick={() => handleUpgrade('pro')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Start Your Free Trial'}
            {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </motion.div>
      </section>
    </div>
  )
}
