import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Shield, AlertCircle, Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react'

interface PasswordPromptProps {
  mode: 'setup' | 'unlock'
  onSubmit: (password: string) => Promise<void>
  onCancel?: () => void
  onReset?: () => void
  onOpenChange?: (open: boolean) => void
  open?: boolean
  error?: string | null
}

export function PasswordPrompt({
  mode,
  onSubmit,
  onCancel,
  onReset,
  onOpenChange,
  open = true,
  error: externalError,
}: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const error = externalError || internalError

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setInternalError(null)

      if (password.length < 8) {
        setInternalError('Password must be at least 8 characters')
        return
      }

      if (mode === 'setup' && password !== confirmPassword) {
        setInternalError('Passwords do not match')
        return
      }

      setIsLoading(true)
      try {
        await onSubmit(password)
      } catch (err) {
        setInternalError(
          err instanceof Error ? err.message : 'An error occurred'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [password, confirmPassword, mode, onSubmit]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && onOpenChange) {
        onOpenChange(false)
        if (onCancel) {
          onCancel()
        }
      }
    },
    [onOpenChange, onCancel]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-[#f5efe6] border-[#d4c8b8] p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-br from-[#7a5c3a] to-[#5c452a] p-6 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              {mode === 'setup' ? (
                <KeyRound className="w-8 h-8" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-white">
            {mode === 'setup' ? 'Secure Your API Keys' : 'Unlock Struktur'}
          </DialogTitle>
          <p className="text-[#f5efe6]/80 text-center mt-2 text-sm">
            {mode === 'setup'
              ? 'Create a password to encrypt your API keys locally'
              : 'Enter your password to access your API keys'}
          </p>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Security notice for setup mode */}
          {mode === 'setup' && (
            <div className="bg-[#ede5d8] rounded-xl p-4 border border-[#d4c8b8]">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#7a5c3a] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#2d1b0e]">
                  <p className="font-medium mb-1">End-to-End Encryption</p>
                  <p className="text-[#7a5c3a] leading-relaxed">
                    Your API keys are encrypted in your browser. The password
                    is never sent to our servers. If you forget it, you will
                    need to re-enter all API keys.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-[#2d1b0e]"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === 'setup'
                    ? 'Create a strong password (min 8 chars)'
                    : 'Enter your password'
                }
                className="h-12 bg-[#ede5d8] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f]/60 pr-10 focus-visible:ring-[#7a5c3a]"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0926f] hover:text-[#7a5c3a] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password field (setup only) */}
          {mode === 'setup' && (
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-[#2d1b0e]"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="h-12 bg-[#ede5d8] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f]/60 focus-visible:ring-[#7a5c3a]"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-[#f5e6e6] border border-[#c4a8a8] rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#a05c5c] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#8a4a4a]">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {mode === 'unlock' && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (onCancel) {
                    onCancel()
                  }
                }}
                disabled={isLoading}
                className="flex-1 h-12 border-[#d4c8b8] text-[#7a5c3a] hover:bg-[#ede5d8] hover:text-[#2d1b0e]"
              >
                Skip for Now
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || password.length === 0}
              className="flex-1 h-12 bg-[#7a5c3a] text-white hover:bg-[#5c452a] disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'setup' ? 'Setting up...' : 'Unlocking...'}
                </span>
              ) : mode === 'setup' ? (
                'Create Secure Storage'
              ) : (
                'Unlock'
              )}
            </Button>
          </div>

          {/* Reset button (unlock mode only) */}
          {mode === 'unlock' && onReset && (
            <div className="pt-2">
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-xs text-[#a05c5c] hover:text-[#8a4a4a] flex items-center gap-1.5 mx-auto transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Forgot password? Reset storage
                </button>
              ) : (
                <div className="bg-[#f5e6e6] border border-[#c4a8a8] rounded-lg p-3">
                  <p className="text-sm text-[#8a4a4a] mb-3">
                    <strong>Warning:</strong> This will delete all stored API keys. This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 h-9 border-[#d4c8b8] text-[#7a5c3a] hover:bg-[#ede5d8]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        onReset()
                        setShowResetConfirm(false)
                      }}
                      className="flex-1 h-9 bg-[#a05c5c] text-white hover:bg-[#8a4a4a]"
                    >
                      Delete All Keys
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password requirements hint (setup only) */}
          {mode === 'setup' && (
            <p className="text-xs text-[#a0926f] text-center">
              This password cannot be recovered. Make sure to remember it or
              store it safely.
            </p>
          )}

          {/* Footer note */}
          <p className="text-center text-[#a0926f] text-xs pt-2">
            Your API keys are encrypted with your password and are stored locally on your device only.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
