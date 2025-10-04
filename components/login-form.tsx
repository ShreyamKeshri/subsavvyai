"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import { toast } from "sonner"
import { branding } from "@/lib/config/branding"

const phoneSchema = z.object({
  countryCode: z.string(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, "Only numbers allowed"),
})

type PhoneFormData = z.infer<typeof phoneSchema>

export function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "+91",
      phoneNumber: "",
    },
  })

  const handlePhoneSubmit = async (_data: PhoneFormData) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("OTP sent successfully!")
    setStep("otp")
    setIsLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    // eslint-disable-next-line security/detect-object-injection
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line security/detect-object-injection
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Login successful!")
    setIsLoading(false)
    // In real app: window.location.href = "/dashboard"
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Signed in with Google!")
    setIsLoading(false)
    // In real app: redirect to Google OAuth
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-balance">Welcome to {branding.name}</CardTitle>
        <CardDescription className="text-base text-pretty">
          {step === "phone" ? "Enter your phone number to get started" : "Enter the 6-digit code sent to your phone"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "phone" ? (
          <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <Select
                  value={phoneForm.watch("countryCode")}
                  onValueChange={(value: string) => phoneForm.setValue("countryCode", value)}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+61">🇦🇺 +61</SelectItem>
                    <SelectItem value="+81">🇯🇵 +81</SelectItem>
                    <SelectItem value="+86">🇨🇳 +86</SelectItem>
                    <SelectItem value="+49">🇩🇪 +49</SelectItem>
                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  {...phoneForm.register("phoneNumber")}
                  className="flex-1"
                  maxLength={10}
                />
              </div>
              {phoneForm.formState.errors.phoneNumber && (
                <p className="text-sm text-destructive">{phoneForm.formState.errors.phoneNumber.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Sending..." : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Enter OTP</Label>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    disabled={isLoading}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Sent to {phoneForm.getValues("countryCode")} {phoneForm.getValues("phoneNumber")}
              </p>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("phone")}
              disabled={isLoading}
            >
              Change phone number
            </Button>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-xs text-center text-muted-foreground text-pretty">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  )
}
