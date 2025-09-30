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

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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
          router.replace("/dashboard")
        }
      } catch (err: any) {
        console.error('❌ Redirect result error:', err)
        setError(`Sign-in failed: ${err.message}`)
      }
    }
    checkRedirectResult()
  }, [])

  const handleAuth = async (mode: "login" | "register") => {
    setError(null)

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsSubmitting(true)
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      router.replace("/dashboard")
    } catch (err: any) {
      console.error('❌ Email/Password auth error:', err)
      
      // Handle account linking for existing Google users
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError("An account with this email already exists. Please sign in with Google first, then you can add email/password login in your profile settings.")
      } else if (err.code === 'auth/email-already-in-use' && mode === 'register') {
        setError("An account with this email already exists. Please sign in instead, or use 'Forgot Password' if needed.")
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please register first.")
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again or use 'Forgot Password'.")
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.")
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.")
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
      setIsSubmitting(true)
      
      // Try popup first, fallback to redirect if blocked
      try {
        const result = await signInWithPopup(auth, provider)
        console.log('✅ Google popup sign-in successful:', result.user.email)
        router.replace("/dashboard")
      } catch (popupError: any) {
        // Handle account exists with different credential
        if (popupError.code === 'auth/account-exists-with-different-credential') {
          const email = popupError.customData?.email
          setError(`An account with email ${email} already exists with email/password login. Please sign in with your email and password first, then you can link your Google account in profile settings.`)
          return
        }
        
        // If popup is blocked, use redirect method
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
          console.log('🔄 Popup blocked, using redirect method...')
          await signInWithRedirect(auth, provider)
          // signInWithRedirect doesn't return immediately, it redirects the page
          return
        } else {
          throw popupError
        }
      }
    } catch (err: any) {
      console.error('❌ Google sign-in error:', err)
      
      let errorMessage = "Google sign-in failed"
      
      // Handle specific Firebase Auth errors
      switch (err.code) {
        case 'auth/account-exists-with-different-credential':
          const email = err.customData?.email || 'this email'
          errorMessage = `An account with ${email} already exists with email/password login. Please sign in with your email and password first.`
          break
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in was cancelled. Please try again."
          break
        case 'auth/popup-blocked':
          errorMessage = "Pop-up was blocked. Redirecting to Google sign-in..."
          // Fallback to redirect
          try {
            await signInWithRedirect(auth, provider)
            return
          } catch (redirectErr) {
            errorMessage = "Unable to sign in with Google. Please try again."
          }
          break
        case 'auth/cancelled-popup-request':
          errorMessage = "Sign-in was cancelled. Please try again."
          break
        case 'auth/configuration-not-found':
          errorMessage = "Google sign-in is not properly configured. Please contact support."
          break
        case 'auth/unauthorized-domain':
          errorMessage = "This domain is not authorized for Google sign-in. Please contact support."
          break
        case 'auth/operation-not-allowed':
          errorMessage = "Google sign-in is not enabled. Please contact support."
          break
        default:
          errorMessage = `Google sign-in failed: ${err.message || 'Unknown error'}`
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="text-lg font-semibold">
            Cash Track
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-semibold">Access your dashboard</CardTitle>
            <CardDescription>Sign in to continue tracking your cash flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Continue with Google"}
            </Button>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" onClick={() => handleAuth("login")} disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm password</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" onClick={() => handleAuth("register")} disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create account"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}