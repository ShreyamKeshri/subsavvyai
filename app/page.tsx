import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  BarChart3,
  Scissors,
  Scan,
  Wallet,
  Bell,
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
import { branding } from "@/lib/config/branding"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo-icon.png" alt={branding.name} className="h-10 w-10" />
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
      <section className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
              Join 50,000+ Indians already saving money
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
              Track Every Subscription. Save Thousands Every Year.
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              {branding.name} finds all your subscriptions, shows exactly what you&apos;re spending, and helps you cancel the
              ones you don&apos;t need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 h-14 w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-lg h-14"
                asChild
              >
                <Link href="#how-it-works">
                  See How It Works
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
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
                    <div className="text-3xl font-bold text-green-600">₹2,847</div>
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
                title: "Forgot you signed up",
                description: "Free trials that auto-renewed months ago",
              },
              {
                icon: CreditCard,
                title: "Free trials auto-renewed",
                description: "Charges you didn't expect or notice",
              },
              {
                icon: XCircle,
                title: "Subscriptions you never use",
                description: "Paying for services you forgot about",
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
                icon: Mail,
                number: "1",
                title: "Connect Your Gmail",
                description: "We securely scan for subscription receipts (read-only access)",
              },
              {
                icon: BarChart3,
                number: "2",
                title: "See Everything",
                description: "All subscriptions in one dashboard with spending insights",
              },
              {
                icon: Scissors,
                number: "3",
                title: "Cancel Easily",
                description: "Step-by-step guides for every service in India",
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Take Control</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Scan,
                title: "Gmail Auto-Scan",
                description: "Automatically finds subscriptions from receipts",
              },
              {
                icon: Wallet,
                title: "Spending Tracker",
                description: "See monthly, yearly costs at a glance",
              },
              {
                icon: Bell,
                title: "Renewal Reminders",
                description: "Get notified before charges hit",
              },
              {
                icon: FileText,
                title: "Cancellation Guides",
                description: "Easy steps for Netflix, Prime, Hotstar & more",
              },
              {
                icon: TrendingUp,
                title: "Spending Insights",
                description: "Understand your subscription patterns",
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "256-bit encryption, never stored",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-6 lg:p-8 space-y-4 bg-white border-gray-200 hover:border-green-600 hover:shadow-lg transition"
              >
                <feature.icon className="w-10 h-10 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Stats Bar */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900">50,000+</div>
              <div className="text-lg text-gray-600">Happy Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold text-gray-900">₹5 Crore+</div>
              <div className="text-lg text-gray-600">Saved</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-current" />
                ))}
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-gray-900">4.8★</div>
              <div className="text-lg text-gray-600">Average Rating</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Saved ₹8,400 in 6 months! Found subscriptions I completely forgot about.",
                name: "Priya S.",
                location: "Mumbai",
              },
              {
                quote: "The Gmail scan found 12 active subscriptions. I only knew about 5!",
                name: "Rahul K.",
                location: "Bangalore",
              },
              {
                quote: "Canceled my old gym membership from 2 years ago. Thank you!",
                name: "Ananya M.",
                location: "Delhi",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-8 space-y-6 border-gray-200 bg-white shadow-md">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full" />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
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
                <img src="/logo-icon.png" alt={branding.name} className="h-8 w-8" />
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
