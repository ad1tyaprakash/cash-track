"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth } from "@/lib/firebase"
import { loginWithGoogle } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          console.log('✅ Google redirect sign-in successful:', result.user.email)
          
          // Check if user needs to set a password
          const hasPasswordProvider = result.user.providerData.some(
            provider => provider.providerId === 'password'
          )
          
          // Sync to backend for unified user management
          try {
            const token = await result.user.getIdToken()
            await loginWithGoogle(token)
            console.log('✅ Backend sync successful')
          } catch (err) {
            console.log('Backend sync failed, but Firebase auth successful')
          }
          
          if (hasPasswordProvider) {
            router.replace("/dashboard")
          } else {
            // Force password creation for Google-only users
            router.replace("/complete-profile")
          }
        }
      } catch (err: any) {
        console.error('❌ Redirect result error:', err)
        setError(`Sign-in failed: ${err.message}`)
      }
    }
    checkRedirectResult()
  }, [])

  const handleEmailAuth = async (mode: "login" | "register") => {
    setError(null)

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setIsSubmitting(true)
      
      let userCredential
      if (mode === "login") {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
      }
      
      // Sync to backend for unified user management
      try {
        const token = await userCredential.user.getIdToken()
        await loginWithGoogle(token) // Using same endpoint for both auth methods
        console.log('✅ Backend sync successful')
      } catch (err) {
        console.log('Backend sync failed, but Firebase auth successful')
      }
      
      console.log('✅ Firebase email auth successful:', userCredential.user.email)
      router.replace("/dashboard")
    } catch (err: any) {
      console.error('❌ Firebase email auth error:', err)
      
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please register first.")
      } else if (err.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.")
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.")
      } else if (err.code === 'auth/weak-password') {
        setError("Password must be at least 6 characters long.")
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.")
      } else {
        setError(err.message || "Authentication failed")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    const provider = new GoogleAuthProvider()
    
    // Add additional scopes if needed
    provider.addScope('email')
    provider.addScope('profile')

    try {
      console.log('🔍 Attempting Google sign-in...')
      setIsSubmitting(true)
      
      // Determine if we should use popup or redirect based on the environment
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        console.log('📱 Mobile detected, using redirect flow')
        await signInWithRedirect(auth, provider)
        // Note: redirect will happen, so this code won't execute
      } else {
        console.log('💻 Desktop detected, using popup flow')
        const result = await signInWithPopup(auth, provider)
        console.log('✅ Google popup sign-in successful:', result.user.email)
        
        // Check if user needs to set a password
        const hasPasswordProvider = result.user.providerData.some(
          provider => provider.providerId === 'password'
        )
        
        // Sync to backend for unified user management
        try {
          const token = await result.user.getIdToken()
          await loginWithGoogle(token)
          console.log('✅ Backend sync successful')
        } catch (err) {
          console.log('Backend sync failed, but Firebase auth successful')
        }
        
        if (hasPasswordProvider) {
          router.replace("/dashboard")
        } else {
          // Force password creation for Google-only users
          router.replace("/complete-profile")
        }
      }
    } catch (err: any) {
      console.error('❌ Google sign-in error:', err)
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled. Please try again.")
      } else if (err.code === 'auth/popup-blocked') {
        setError("Pop-up was blocked by your browser. Please allow pop-ups and try again, or try refreshing the page.")
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection and try again.")
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please wait a moment and try again.")
      } else {
        setError(err.message || "Google sign-in failed")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Already signed in. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Welcome to CashTrack</CardTitle>
          <CardDescription>
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button className="w-full" onClick={() => handleEmailAuth("login")} disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or register with email
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name (Optional)</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
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
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button className="w-full" onClick={() => handleEmailAuth("register")} disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              New to CashTrack?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}