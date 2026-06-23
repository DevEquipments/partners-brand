import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/authApi";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  BarChart3,
  Users,
  Shield,
} from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data.email, data.password);
      const token =
        response.token || response.data?.token || response.access_token;

      if (token) {
        login(token, response.user || response.data?.user);
        toast.success("Login successful! Welcome back.");
        await fetchProfile();
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Hero Section - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900/80 to-orange-700">
        {" "}
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-500 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
        {/* Content */}
        <div className="relative flex gap-3 flex-col z-10 max-w-lg mx-auto px-10 text-white">
          {/* Logo */}
          <div className="mb-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ED</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">EquipmentsDekho</h2>
                <p className="text-sm text-orange-100 font-medium">
                  Partner Portal
                </p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl xl:text-3xl font-bold tracking-tight leading-tight">
            Manage Your Brand Partnership With Confidence
          </h1>

          {/* Description */}
          <p className="text-sm max-w-md text-orange-100 leading-relaxed">
            Access powerful analytics, manage customer inquiries, track leads,
            and grow your business through EquipmentsDekho Partner Portal.
          </p>

          {/* Feature Cards */}
          <div className="space-y-5">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {" "}
                    Real-time Analytics
                  </h3>
                  <p className="text-xs text-orange-100">
                    Track leads and performance metrics instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Lead Management</h3>
                  <p className="text-xs text-orange-100">
                    Manage and respond to customer inquiries
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Secure Platform</h3>
                  <p className="text-xs text-orange-100">
                    Enterprise-grade security for your data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-2/5 flex items-center justify-center px-8 lg:mx-16 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">ED</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  EquipmentsDekho
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Partner Portal
                </p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 lg:p-10">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2 ">
                Welcome Back
              </h1>
              <p className="text-slate-500">
                Sign in to your partner account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-slate-300 ${
                      errors.email
                        ? "border-red-300 focus:ring-red-100"
                        : "border-slate-200"
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-12 w-full rounded-xl border bg-white pl-11 pr-11 transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100 hover:border-slate-300 ${
                      errors.password
                        ? "border-red-300 focus:ring-red-100"
                        : "border-slate-200"
                    }`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 4,
                        message: "Password must be at least 4 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 hover:bg-slate-100 rounded-lg p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    {...register("remember")}
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="border-t border-slate-200 mt-10 pt-6">
              {/* Register Link */}
              <p className="text-center text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
