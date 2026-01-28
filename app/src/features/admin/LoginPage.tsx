import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, initialised } = useAuthStore()

  useEffect(() => {
    document.title = 'Login - Sensory Guide Admin'
  }, [])

  useEffect(() => {
    if (initialised && user) {
      navigate('/admin', { replace: true })
    }
  }, [user, initialised, navigate])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await loginWithEmail(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.includes('invalid-credential') || message.includes('wrong-password')) {
        setError('Invalid email or password')
      } else if (message.includes('user-disabled')) {
        setError('Account disabled. Contact support.')
      } else if (message.includes('network')) {
        setError('Network error. Check your connection.')
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setSubmitting(true)

    try {
      await loginWithGoogle()
      navigate('/admin', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.includes('popup-closed')) {
        setError('Sign-in cancelled')
      } else {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sensory Guide</h1>
          <p className="text-muted-foreground mt-2">Sign in to admin portal</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-2 px-4 border rounded-md hover:bg-accent disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
