import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Hexagon,
  Send,
} from 'lucide-react';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = async () => {
    setIsLoading(true);
    // Simulate API call (UI only for now)
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">EquipmentsDekho</h2>
              <p className="text-[10px] text-surface-400 font-medium">Partner Portal</p>
            </div>
          </div>

          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-surface-900 mb-1">Forgot your password?</h1>
                <p className="text-sm text-surface-500">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-11 ${errors.email ? 'border-red-300 focus:ring-red-100' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl
                    hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 mb-2">Check your email</h2>
              <p className="text-sm text-surface-500 mb-6">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-surface-700">{getValues('email')}</span>.
                Please check your inbox and follow the instructions.
              </p>
              <div className="bg-surface-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-surface-500">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
