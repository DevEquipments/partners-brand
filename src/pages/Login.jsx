import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authApi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Checkbox from "../components/common/Checkbox";
import ThemeToggle from "../components/layout/ThemeToggle";
import { normalizeUserType } from "../utils/roleUtils";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
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
      remember: true,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setAuthError("");

    try {
      const response = await loginUser({
        email: data.email.trim(),
        password: data.password,
      });

      if (response?.status === false) {
        const msg = response?.message || "Invalid credentials. Please verify your email and password.";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      const token =
        response.token || response.data?.token || response.access_token;

      if (!token) {
        const msg = response.message || "Authentication token missing from response.";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      const rawUserType = response.user_type || response.data?.user_type;
      const normalizedRole = normalizeUserType(rawUserType);

      if (!normalizedRole) {
        const msg = rawUserType
          ? `Unauthorized account type (${rawUserType}). Please contact administrator.`
          : "Missing account authorization type in server response.";
        setAuthError(msg);
        toast.error(msg);
        return;
      }

      const userData =
        response.data && typeof response.data === "object" && !response.data.token
          ? response.data
          : response.user || {};

      const fullUserData = {
        ...userData,
        user_type: rawUserType,
        role: normalizedRole,
      };

      login(token, fullUserData, rawUserType);
      toast.success("Authentication successful. Welcome back.");

      // Fetch latest profile metadata asynchronously in background without blocking redirection
      fetchProfile().catch(() => {});

      // Navigate to the role-aware dashboard
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to log in. Please check your credentials and try again.";
      setAuthError(msg);
      if (!error?.toastShown) {
        toast.error(msg, { id: "auth-login-error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 antialiased select-none">
      {/* Left hero section - Industrial & Enterprise */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950 border-r border-slate-800 p-12 flex-col justify-between">
        {/* Subtle geometric gradient background */}
        <div className="absolute inset-0 bg-radial-[at_top_left] from-orange-950/20 via-slate-950 to-slate-950 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center p-1.5 shadow-md">
            <img src={logo} alt="EquipmentsDekho" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white uppercase block">
              Equipments Dekho
            </span>
            <span className="text-[11px] font-semibold text-orange-400 tracking-wider uppercase block">
              Partner Operations Platform
            </span>
          </div>
        </div>

        {/* Central Enterprise Message */}
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-orange-500" />
            <span>Dedicated Brand Operations Portal</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Streamlined Management for Heavy Equipment Brand Partners
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Manage your brand operations, monitor customer inquiries, track equipment quotation requests, and collaborate seamlessly across your organization.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <p className="text-slate-400">Direct Inquiries</p>
              <p className="text-base font-bold text-white mt-0.5">Real-time Delivery</p>
            </div>
            <div>
              <p className="text-slate-400">Security</p>
              <p className="text-base font-bold text-white mt-0.5">Role-Gated Access</p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 text-xs text-slate-500">
          Equipments Dekho Partner Network. All rights reserved.
        </div>
      </div>

      {/* Right form section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {/* Top utility row */}
        <div className="flex items-center justify-between">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center p-1 shadow-sm">
              <img src={logo} alt="EquipmentsDekho" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              Equipments Dekho
            </span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Partner Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to access your brand operations platform.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 animate-fade-in">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="partner@brand.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email address",
                },
              })}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                icon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                })}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <Checkbox
                label="Remember this device"
                {...register("remember")}
              />
              <Link
                to="/forgot-password"
                className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Portal
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized partner personnel only. Activity is monitored and encrypted.
            </p>
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-600">
          Equipments Dekho Platform v2.0
        </div>
      </div>
    </div>
  );
};

export default Login;
