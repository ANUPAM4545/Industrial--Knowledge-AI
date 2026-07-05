import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { addToast } = useToastStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const resp = await authService.login(data.email, data.password)
      login(resp.user, resp.tokens)
      addToast('Welcome back! Signed in successfully.', 'success')
      navigate('/app/dashboard')
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || 'Invalid email or password. Please try again.'
      addToast(errMsg, 'error')
    }
  }

  return (
    <div className="animate-fade-in bg-slate-900/60 border border-slate-800 p-8 rounded-xl shadow-2xl backdrop-blur-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-slate-400 text-sm">
          Sign in to your ForgeMind AI account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="login-email">
            Email address
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={cn('input-field pl-10', errors.email && 'border-red-500/50 focus:ring-red-500/50')}
              placeholder="engineer@company.com"
              {...register('email')}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={cn('input-field pl-10 pr-10', errors.password && 'border-red-500/50')}
              placeholder="••••••••"
              {...register('password')}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
export default LoginPage
