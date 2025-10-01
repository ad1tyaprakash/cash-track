"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePassword?: boolean
}

export function ProtectedRoute({ children, requirePassword = true }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace("/login")
      return
    }

    if (requirePassword) {
      // Check if user has password authentication
      const hasPasswordProvider = user.providerData.some(
        provider => provider.providerId === 'password'
      )

      if (!hasPasswordProvider) {
        // User signed up with Google only, needs to set password
        router.replace("/complete-profile")
        return
      }
    }
  }, [user, loading, router, requirePassword])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (requirePassword) {
    const hasPasswordProvider = user.providerData.some(
      provider => provider.providerId === 'password'
    )

    if (!hasPasswordProvider) {
      return null // Will redirect to complete-profile
    }
  }

  return <>{children}</>
}