"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  GoogleAuthProvider, 
  EmailAuthProvider, 
  linkWithCredential,
  linkWithPopup,
  unlink,
  updatePassword,
  reauthenticateWithCredential
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface UserProfile {
  uid: string
  email: string
  display_name?: string
  photo_url?: string
  email_verified: boolean
  providers: string[]
  account_linking_available: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const token = await user.getIdToken()
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        } else {
          setError('Failed to load profile')
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleLinkGoogle = async () => {
    if (!user) return

    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      await linkWithPopup(user, provider)
      
      // Refresh profile data
      window.location.reload()
    } catch (err: any) {
      console.error('Google linking error:', err)
      if (err.code === 'auth/credential-already-in-use') {
        setError('This Google account is already linked to another Cash Track account.')
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('This Google account is already associated with a different account.')
      } else {
        setError('Failed to link Google account. Please try again.')
      }
    }
  }

  const handleLinkEmailPassword = async () => {
    if (!user || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    try {
      setError(null)
      setIsUpdatingPassword(true)
      
      const credential = EmailAuthProvider.credential(user.email!, newPassword)
      await linkWithCredential(user, credential)
      
      setNewPassword("")
      setConfirmPassword("")
      // Refresh profile data
      window.location.reload()
    } catch (err: any) {
      console.error('Email/password linking error:', err)
      if (err.code === 'auth/credential-already-in-use') {
        setError('This email is already linked to another account.')
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.')
      } else {
        setError('Failed to add email/password login. Please try again.')
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    try {
      setError(null)
      setIsUpdatingPassword(true)
      
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, newPassword)
      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setError(null)
      alert('Password updated successfully!')
    } catch (err: any) {
      console.error('Password update error:', err)
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect.')
      } else if (err.code === 'auth/weak-password') {
        setError('New password is too weak. Please choose a stronger password.')
      } else {
        setError('Failed to update password. Please try again.')
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleUnlinkProvider = async (providerId: string) => {
    if (!user) return

    try {
      setError(null)
      await unlink(user, providerId)
      // Refresh profile data
      window.location.reload()
    } catch (err: any) {
      console.error('Unlink error:', err)
      setError(`Failed to unlink ${providerId}. Please try again.`)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading profile...</div>
  }

  if (!profile) {
    return <div className="container mx-auto p-6">Failed to load profile</div>
  }

  const hasEmailProvider = profile.providers.includes('password') || profile.providers.includes('email')
  const hasGoogleProvider = profile.providers.includes('google.com')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">{profile.email}</span>
              {profile.email_verified ? (
                <Badge variant="secondary">Verified</Badge>
              ) : (
                <Badge variant="destructive">Not Verified</Badge>
              )}
            </div>
          </div>
          {profile.display_name && (
            <div>
              <Label>Display Name</Label>
              <p className="text-sm">{profile.display_name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
          <CardDescription>Manage how you sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Methods */}
          <div>
            <Label className="text-base font-medium">Current Sign-in Methods</Label>
            <div className="mt-2 space-y-2">
              {hasGoogleProvider && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <span>Google Account</span>
                    <Badge>Linked</Badge>
                  </div>
                  {profile.providers.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnlinkProvider('google.com')}
                    >
                      Unlink
                    </Button>
                  )}
                </div>
              )}
              {hasEmailProvider && (
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <span>Email & Password</span>
                    <Badge>Linked</Badge>
                  </div>
                  {profile.providers.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnlinkProvider('password')}
                    >
                      Unlink
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Add Methods */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Add Sign-in Methods</Label>
            
            {!hasGoogleProvider && (
              <div className="p-3 border rounded space-y-3">
                <div>
                  <h4 className="font-medium">Link Google Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign in with your Google account for faster access
                  </p>
                </div>
                <Button onClick={handleLinkGoogle} variant="outline">
                  Link Google Account
                </Button>
              </div>
            )}

            {!hasEmailProvider && (
              <div className="p-3 border rounded space-y-3">
                <div>
                  <h4 className="font-medium">Add Email & Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a password to sign in with your email
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-password">Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button 
                    onClick={handleLinkEmailPassword}
                    disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                  >
                    {isUpdatingPassword ? 'Adding...' : 'Add Email/Password Login'}
                  </Button>
                </div>
              </div>
            )}

            {hasEmailProvider && (
              <div className="p-3 border rounded space-y-3">
                <div>
                  <h4 className="font-medium">Update Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Change your current password
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password-update">New Password</Label>
                    <Input
                      id="new-password-update"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password-update">Confirm New Password</Label>
                    <Input
                      id="confirm-password-update"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button 
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}