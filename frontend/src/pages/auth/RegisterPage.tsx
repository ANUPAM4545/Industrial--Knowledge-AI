import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['engineer', 'manager', 'operator']),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'operator' },
  })

  const onSubmit = async (data: RegisterFormData) => {
    // TODO: Implement registration API call
    console.log('Register submitted:', data)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-slate-400 text-sm">Join ForgeMind AI today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
        <div className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-fullname">
              Full Name
            </label>
            <input
              id="reg-fullname"
              type="text"
              className={cn('input-field', errors.full_name && 'border-red-500/50')}
              placeholder="John Smith"
              {...register('full_name')}
            />
            {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-username">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              className={cn('input-field', errors.username && 'border-red-500/50')}
              placeholder="john_smith"
              {...register('username')}
            />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-role">
              Role
            </label>
            <select
              id="reg-role"
              className="input-field"
              {...register('role')}
            >
              <option value="operator">Operator</option>
              <option value="engineer">Engineer</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-email">
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            className={cn('input-field', errors.email && 'border-red-500/50')}
            placeholder="engineer@company.com"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reg-password">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            className={cn('input-field', errors.password && 'border-red-500/50')}
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <button
          id="register-submit"
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-3 mt-2"
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
        <Link to="/login" className="text-forge-400 hover:text-forge-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
