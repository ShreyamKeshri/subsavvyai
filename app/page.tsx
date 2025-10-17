import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Scan,
  Wallet,
  FileText,
  TrendingUp,
  Shield,
  AlertCircle,
  CreditCard,
  XCircle,
  Star,
  ArrowRight,
  Menu,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { branding } from "@/lib/config/branding"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo-icon.png" alt={branding.name} width={40} height={40} className="h-10 w-10" />
            <span className="text-2xl font-bold text-gray-900">{branding.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link href="/signup">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started Free</Button>
            </Link>
          </nav>
          <button className="md:hidden">
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-green-100 blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal-100 blur-3xl opacity-30" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 w-fit">
              <Star className="w-4 h-4 mr-1 fill-green-600 text-green-600" />
              AI-Powered Savings for Indian Users
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
              Take Control of Your Subscriptions —{" "}
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Save Smarter with AI
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              Stop overpaying for subscriptions. {branding.name} uses intelligent AI to track usage, alert you to savings, and recommend smarter bundles. Save up to ₹10,000/year on your digital subscriptions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 h-14 w-full sm:w-auto group">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg h-14 w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                100% Secure
              </div>
              <div className="flex items-center gap-2">
                <span>🇮🇳</span>
                Made for India
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Free Forever Plan
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative">
            <Card className="p-6 shadow-2xl border-gray-200 bg-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-lg">Your Subscriptions</h3>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Monthly Total</div>
                    <div className="text-3xl font-bold text-green-600">₹1,067</div>
                  </div>
                </div>
                {[
                  { name: "Netflix", amount: "₹649", color: "bg-red-500" },
                  { name: "Amazon Prime", amount: "₹299", color: "bg-blue-500" },
                  { name: "Spotify", amount: "₹119", color: "bg-green-500" },
                ].map((sub, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 ${sub.color} rounded-lg flex items-center justify-center text-white font-bold shadow-sm`}
                      >
                        {sub.name[0]}
                      </div>
                      <span className="font-medium text-gray-900">{sub.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">{sub.amount}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">THE PROBLEM</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Losing ₹12,000/year on forgotten subscriptions?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: AlertCircle,
                title: "Forgotten free trials",
                description: "Free trials that quietly turned into paid plans months ago",
              },
              {
                icon: CreditCard,
                title: "Unexpected charges",
                description: "Auto-renewals and hidden fees you never noticed",
              },
              {
                icon: XCircle,
                title: "Unused subscriptions",
                description: "Services you're still paying for but never actually use",
              },
            ].map((item, i) => (
              <Card key={i} className="p-8 text-center space-y-4 border-gray-200 bg-white hover:shadow-lg transition">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                  <item.icon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              Average Indian wastes <span className="text-red-600">₹12,000-₹15,000 yearly</span>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Three Simple Steps to Start Saving</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Wallet,
                number: "1",
                title: "Add Your Subscriptions",
                description: "Quickly add subscriptions from 52 pre-loaded Indian services",
              },
              {
                icon: BarChart3,
                number: "2",
                title: "Connect Services & Track Usage",
                description: "Connect Spotify to get AI-powered insights on your actual usage",
              },
              {
                icon: TrendingUp,
                number: "3",
                title: "Get AI Savings Recommendations",
                description: "Smart downgrade alerts & telecom bundle savings powered by AI",
              },
            ].map((step, i) => (
              <Card key={i} className="p-8 space-y-6 border-gray-200 bg-white hover:shadow-xl transition relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {step.number}
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">FEATURES</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Powerful AI Features to Save You Money</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to take control of your subscriptions</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wallet,
                title: "Smart Subscription Tracking",
                description: "Track all your subscriptions with 52 pre-loaded Indian services. Add Netflix, Prime, Spotify and more in seconds.",
                badge: null,
              },
              {
                icon: BarChart3,
                title: "Spending Dashboard",
                description: "See monthly, yearly costs and category breakdown at a glance. Know exactly where your money goes.",
                badge: null,
              },
              {
                icon: TrendingUp,
                title: "AI Downgrade Alerts",
                description: "Connect Spotify and get smart recommendations based on actual usage. Save ₹1,400+/year by downgrading unused plans.",
                badge: "AI",
              },
              {
                icon: Scan,
                title: "India Bundle Optimizer",
                description: "Find telecom bundles from Jio, Airtel & Vi that save ₹10,000+/year on your OTT subscriptions.",
                badge: "AI",
              },
              {
                icon: FileText,
                title: "Manual Usage Tracking",
                description: "Track usage for services without API integrations. Works with Netflix, Hotstar, Prime Video and more.",
                badge: null,
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Row-level security, encrypted OAuth tokens, HTTPS-only. Your data is safe with us.",
                badge: null,
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group relative p-6 lg:p-8 space-y-4 bg-white border-gray-200 hover:border-green-600 hover:shadow-lg transition overflow-hidden"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                {feature.badge && (
                  <Badge className="absolute top-4 right-4 bg-green-600 text-white hover:bg-green-700">
                    {feature.badge}
                  </Badge>
                )}
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">TRUSTED BY THOUSANDS</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Join Indians Saving Money Every Day</h2>
          </div>
          {/* Stats Bar */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-8 border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">₹10,000+</div>
              <div className="text-lg text-gray-600">Average Annual Savings</div>
            </Card>
            <Card className="p-8 border-gray-200 bg-gradient-to-br from-blue-50 to-white">
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">52+</div>
              <div className="text-lg text-gray-600">Indian Services Supported</div>
            </Card>
            <Card className="p-8 border-gray-200 bg-gradient-to-br from-purple-50 to-white">
              <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">2 AI</div>
              <div className="text-lg text-gray-600">Features Live & Saving Money</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">PRICING</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you&apos;re ready to unlock AI features</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 space-y-6 border-gray-200 bg-white hover:shadow-xl transition">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-600">/forever</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Track up to 5 subscriptions",
                  "Manual usage tracking",
                  "Basic spending insights",
                  "Monthly optimization report",
                  "Dashboard & analytics",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Get Started Free
                </Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 space-y-6 border-green-600 bg-white hover:shadow-2xl transition relative border-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-green-600 text-white hover:bg-green-700">SAVE ₹10,000+/YEAR</Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600">Unlock AI-powered savings</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-gray-900">₹99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Everything in Free",
                  "Unlimited subscriptions",
                  "🤖 AI Downgrade Alerts (Spotify OAuth)",
                  "🤖 India Bundle Optimizer (20+ bundles)",
                  "Advanced analytics & insights",
                  "Priority support",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Start Free Trial
                </Button>
              </Link>
              <p className="text-xs text-center text-gray-500">
                Or ₹999/year (save 17%)
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">FAQ</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Everything you need to know about SubSavvyAI</p>
          </div>
          <div className="space-y-6">
            {[
              {
                question: "How does the AI find savings in my subscriptions?",
                answer: "Our AI tracks your actual usage through OAuth integrations (like Spotify) and manual tracking. It analyzes your usage patterns and recommends cheaper plans if you're underutilizing features, or finds telecom bundles that combine multiple services at lower prices."
              },
              {
                question: "Is my data safe? How do you handle OAuth tokens?",
                answer: "Yes, your data is completely safe. We use bank-level security with row-level database policies, encrypted OAuth tokens, and HTTPS-only connections. We only access the minimum data needed (like listening hours) and never see your passwords."
              },
              {
                question: "What's included in the Free plan?",
                answer: "The Free plan lets you track up to 5 subscriptions, add manual usage data, view basic spending insights, and get monthly optimization reports. It's perfect for getting started and seeing the value."
              },
              {
                question: "What AI features are included in Pro?",
                answer: "Pro unlocks 2 AI features: (1) Smart Downgrade Alerts - connects to Spotify to track usage and recommend cheaper plans, and (2) India Bundle Optimizer - analyzes your subscriptions and finds telecom bundles (Jio, Airtel, Vi) that save ₹10,000+/year."
              },
              {
                question: "Which services can I connect with OAuth?",
                answer: "Currently, we support Spotify OAuth for tracking listening hours. We're adding more services (Netflix, Prime Video, etc.) soon! For services without OAuth, you can manually track usage."
              },
              {
                question: "How accurate are the bundle recommendations?",
                answer: "Our bundle optimizer uses an AI matching algorithm with 95%+ accuracy. It maps your current subscriptions to 20+ real telecom bundles from Jio, Airtel, and Vi, calculates savings, and shows only bundles that actually save you money."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes! There are no contracts. Cancel your Pro subscription anytime and you'll still have access until the end of your billing period. You can always downgrade to the Free plan."
              },
              {
                question: "Do I need a credit card to start?",
                answer: "No credit card required! Start with the Free plan and upgrade to Pro when you're ready to unlock AI features. We accept UPI, cards, and netbanking for Pro subscriptions."
              },
            ].map((faq, i) => (
              <Card key={i} className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-600 dark:hover:border-green-500 transition">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white text-balance">Start Saving Money Today</h2>
          <p className="text-xl text-white/90">Join thousands of Indians taking control of their subscriptions</p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 h-14 transform hover:scale-105 transition"
            >
              Get Started Free
            </Button>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              100% Secure
            </div>
            <div className="flex items-center gap-2">
              <span>🇮🇳</span>
              Made in India
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              No Credit Card Required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/logo-icon.png" alt={branding.name} width={32} height={32} className="h-8 w-8" />
                <div className="text-2xl font-bold">{branding.name}</div>
              </div>
              <p className="text-gray-400 text-sm">{branding.tagline}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-white transition">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="hover:text-white transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 {branding.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
