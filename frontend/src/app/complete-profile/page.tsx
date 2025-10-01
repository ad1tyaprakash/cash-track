"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { updatePassword } from "firebase/auth"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from "@/lib/firebase"

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Redirect if user is not authenticated
    if (!user) {
      router.replace("/login")
      return
    }

    // Check if user already has password auth (signed up with email/password)
    const hasPasswordProvider = user.providerData.some(
      provider => provider.providerId === 'password'
    )

    if (hasPasswordProvider) {
      // User already has password, redirect to dashboard
      router.replace("/dashboard")
    }
  }, [user, router])

  const handleSetPassword = async () => {
    setError(null)

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!auth.currentUser) {
      setError("Authentication error. Please sign in again.")
      return
    }

    try {
      setIsSubmitting(true)
      
      // Add password authentication to the existing Google account
      await updatePassword(auth.currentUser, password)
      
      console.log('✅ Password added successfully')
      router.replace("/dashboard")
    } catch (err: any) {
      console.error('❌ Password setup error:', err)
      
      if (err.code === 'auth/weak-password') {
        setError("Password must be at least 6 characters long")
      } else if (err.code === 'auth/requires-recent-login') {
        setError("For security, please sign out and sign in again, then set your password")
      } else {
        setError(err.message || "Failed to set password. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            To secure your account, please set a password for email sign-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (from Google)</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Set Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleSetPassword} 
              disabled={isSubmitting || !password || !confirmPassword}
            >
              {isSubmitting ? "Setting password..." : "Set Password & Continue"}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>This allows you to sign in with either Google or email/password in the future.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}