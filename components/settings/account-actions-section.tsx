'use client'

/**
 * Account Actions Section Component
 * Account management actions based on Vercel design
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteUserAccount } from '@/lib/user/delete-account'

export function AccountActionsSection() {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Failed to sign out')
      setIsLoggingOut(false)
      return
    }

    toast.success('Signed out successfully')
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteUserAccount()

      if (result.success) {
        toast.success('Your account has been deleted')
        // Wait a moment to show the toast, then redirect
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toast.error(result.error || 'Failed to delete account')
        setIsDeleting(false)
        setShowDeleteConfirm(false)
        setDeleteConfirmText('')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setDeleteConfirmText('')
    }
  }

  return (
    <Card className="p-6 border-red-500/20 bg-red-500/5">
      <h2 className="text-xl font-semibold text-foreground mb-6">Account Actions</h2>

      <div className="space-y-4">
        {/* Logout Button */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Logout</p>
              <p className="text-sm text-muted-foreground">Sign out from your account</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out...' : 'Logout'}
          </Button>
        </div>

        {/* Delete Account Button */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
          </div>
          <Button onClick={() => setShowDeleteConfirm(true)} className="bg-red-500 hover:bg-red-600 text-white">
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Delete Account?</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. All your data, subscriptions, and preferences will be permanently deleted.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Type &quot;DELETE&quot; to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2 rounded-lg bg-muted text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  )
}
