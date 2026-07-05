import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Mail, Lock, User, Shield, Info, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { authService } from '@/services/authService'
import { useToastStore } from '@/store/toastStore'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['engineer', 'manager', 'operator', 'admin']),
})

type RegisterFormData = z.infer<typeof registerSchema>

const roleDescriptions = {
  operator: "Basic RAG search, chat, and download access limits.",
  engineer: "Upload manuals, full AI chat access, and inspect developer metrics.",
  manager: "Upload, inspect analytics, and audit document pipelines.",
  admin: "System configurations, workspace parameters management, and user auditing."
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'operator' | 'engineer' | 'manager' | 'admin'>('operator')
  const navigate = useNavigate()
  const { addToast } = useToastStore()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'operator' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register({
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        password: data.password,
        role: data.role
      })
      addToast('Registration successful! Please sign in with your credentials.', 'success')
      navigate('/login')
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || 'Registration failed. Email or username might be taken.'
      addToast(errMsg, 'error')
    }
  }

  return (
    <div className="animate-fade-in bg-slate-900/60 border border-slate-800 p-8 rounded-xl shadow-2xl backdrop-blur-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm">Join ForgeMind AI today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-fullname">
            Full Name
          </label>
          <div className="relative">
            <input
              id="reg-fullname"
              type="text"
              className={cn('input-field pl-10', errors.full_name && 'border-red-500/50')}
              placeholder="John Smith"
              {...register('full_name')}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-username">
              Username
            </label>
            <div className="relative">
              <input
                id="reg-username"
                type="text"
                className={cn('input-field pl-10', errors.username && 'border-red-500/50')}
                placeholder="john_smith"
                {...register('username')}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-role">
              Role Access
            </label>
            <div className="relative">
              <select
                id="reg-role"
                className="input-field pl-10 cursor-pointer"
                {...register('role')}
                onChange={(e) => {
                  const val = e.target.value as any
                  setSelectedRole(val)
                  setValue('role', val)
                }}
              >
                <option value="operator">Operator</option>
                <option value="engineer">Engineer</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Role Description Tooltip Box */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex gap-2.5 items-start text-xs text-slate-400">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>{roleDescriptions[selectedRole]}</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-email">
            Email Address
          </label>
          <div className="relative">
            <input
              id="reg-email"
              type="email"
              className={cn('input-field pl-10', errors.email && 'border-red-500/50')}
              placeholder="engineer@company.com"
              {...register('email')}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-password">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
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
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <button
          id="register-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
export default RegisterPage
