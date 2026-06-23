import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Hexagon,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

// Each step owns its own set of fields so we only validate what's
// actually on screen before letting someone move forward.
const STEPS = [
  {
    id: 1,
    label: "Business",
    title: "Tell us about your business",
    subtitle: "We'll use this to verify your company and list your brand.",
    fields: ["brand_name", "company_name", "gst", "office_address"],
  },
  {
    id: 2,
    label: "Contact",
    title: "How can renters reach you?",
    subtitle: "Your username doubles as your login, the rest is for enquiries.",
    fields: ["username", "email", "phone_no"],
  },
  {
    id: 3,
    label: "Security",
    title: "Secure your account",
    subtitle:
      "Pick a password you'll remember — you'll need it every time you log in.",
    fields: ["password", "confirm_password"],
  },
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({ mode: "onBlur", shouldUnregister: false });

  const password = watch("password", "");
  const currentStepData = STEPS[currentStep - 1];

  // Real-time checklist so people know exactly what's left, not just a vague bar.
  const passwordChecks = useMemo(
    () => [
      { label: "At least 6 characters", met: password.length >= 6 },
      { label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { label: "One number", met: /[0-9]/.test(password) },
      { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password],
  );

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    const met = passwordChecks.filter((c) => c.met).length;
    if (met <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (met <= 3) return { score: 2, label: "Good", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  }, [password, passwordChecks]);

  const goToStep = (id) => {
    if (id < currentStep) {
      setStepError(false);
      setCurrentStep(id);
    }
  };

  const handleBack = () => {
    setStepError(false);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleNext = async () => {
    const valid = await trigger(currentStepData.fields);
    if (valid) {
      setStepError(false);
      setCurrentStep((s) => Math.min(s + 1, STEPS.length));
    } else {
      setStepError(true);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        brand_name: data.brand_name,
        username: data.username,
        password: data.password,
        company_name: data.company_name,
        office_address: data.office_address,
        phone_no: data.phone_no,
        gst: data.gst,
        email: data.email,
      };

      await registerUser(payload);
      toast.success("Registration successful! Please login to continue.");
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";
      if (!error.response || error.response.status !== 422) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      handleNext();
    } else {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-orange-900/80 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Hexagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">EquipmentsDekho</h2>
              <p className="text-xs text-orange-100 font-medium">
                Partner Portal
              </p>
            </div>
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
            Put your equipment in front
            <br />
            <span className="text-orange-100">
              of buyers who are ready to rent
            </span>
          </h1>
          <p className="text-orange-100 mb-10 max-w-sm leading-relaxed">
            List once and start receiving enquiries from verified businesses
            searching by category, location, and budget.
          </p>

          <div className="space-y-3">
            {[
              "Get matched with buyers searching your exact category",
              "Show off verified badges and customer reviews",
              "Talk to a dedicated account manager, not a ticket queue",
              "Track every enquiry and booking from one dashboard",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span className="text-sm text-orange-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 sm:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">
                EquipmentsDekho
              </h2>
              <p className="text-[10px] text-surface-400 font-medium">
                Partner Portal
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {STEPS.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    disabled={step.id > currentStep}
                    className={`flex items-center gap-2 ${
                      step.id < currentStep
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200 ${
                        isComplete
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-gradient-to-br from-primary-600 to-secondary-600 text-white"
                            : "bg-surface-100 text-surface-400"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </span>
                    <span
                      className={`hidden sm:block text-sm font-medium ${
                        isActive
                          ? "text-surface-900"
                          : isComplete
                            ? "text-surface-600"
                            : "text-surface-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-3 transition-colors duration-300 ${
                        step.id < currentStep
                          ? "bg-emerald-400"
                          : "bg-surface-200"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step header */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-1">
              Step {currentStep} of {STEPS.length}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-1">
              {currentStepData.title}
            </h2>
            <p className="text-surface-500">{currentStepData.subtitle}</p>
          </div>

          {/* Form */}
          <form onSubmit={onFormSubmit} className="space-y-5">
            <div key={currentStep} className="space-y-4 animate-fade-in">
              {/* Step 1: Business */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        Brand Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          placeholder="Your brand name"
                          className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 ${
                            errors.brand_name
                              ? "border-red-300 focus:ring-red-100"
                              : ""
                          }`}
                          {...register("brand_name", {
                            required: "Brand name is required",
                          })}
                        />
                      </div>
                      {errors.brand_name && (
                        <p className="mt-1 text-xs text-red-500 font-medium">
                          {errors.brand_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          placeholder="Legal company name"
                          className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 ${
                            errors.company_name
                              ? "border-red-300 focus:ring-red-100"
                              : ""
                          }`}
                          {...register("company_name", {
                            required: "Company name is required",
                          })}
                        />
                      </div>
                      {errors.company_name && (
                        <p className="mt-1 text-xs text-red-500 font-medium">
                          {errors.company_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      GST Number
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="text"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 ${
                          errors.gst ? "border-red-300 focus:ring-red-100" : ""
                        }`}
                        {...register("gst", {
                          required: "GST number is required",
                          pattern: {
                            value:
                              /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                            message: "Enter a valid GST number",
                          },
                        })}
                      />
                    </div>
                    {errors.gst ? (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.gst.message}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-surface-400">
                        15-character GSTIN, exactly as on your registration
                        certificate
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Office Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-surface-400" />
                      <textarea
                        rows="2"
                        placeholder="Complete office address"
                        className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 resize-none ${
                          errors.office_address
                            ? "border-red-300 focus:ring-red-100"
                            : ""
                        }`}
                        {...register("office_address", {
                          required: "Office address is required",
                        })}
                      ></textarea>
                    </div>
                    {errors.office_address && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.office_address.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Contact */}
              {currentStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="text"
                        placeholder="Choose a username"
                        className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 ${
                          errors.username
                            ? "border-red-300 focus:ring-red-100"
                            : ""
                        }`}
                        {...register("username", {
                          required: "Username is required",
                          minLength: {
                            value: 3,
                            message: "Username must be at least 3 characters",
                          },
                        })}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="email"
                          placeholder="you@company.com"
                          className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 ${
                            errors.email
                              ? "border-red-300 focus:ring-red-100"
                              : ""
                          }`}
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500 font-medium">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="tel"
                          placeholder="Your phone number"
                          className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 ${
                            errors.phone_no
                              ? "border-red-300 focus:ring-red-100"
                              : ""
                          }`}
                          {...register("phone_no", {
                            required: "Phone number is required",
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: "Enter a valid 10-digit phone number",
                            },
                          })}
                        />
                      </div>
                      {errors.phone_no ? (
                        <p className="mt-1 text-xs text-red-500 font-medium">
                          {errors.phone_no.message}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-surface-400">
                          We'll only call if there's an issue with your account
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Security */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 pr-10 ${
                          errors.password
                            ? "border-red-300 focus:ring-red-100"
                            : ""
                        }`}
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.password.message}
                      </p>
                    )}

                    {password && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{
                                width: `${(passwordStrength.score / 3) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength.score === 1
                                ? "text-red-500"
                                : passwordStrength.score === 2
                                  ? "text-amber-500"
                                  : "text-emerald-500"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {passwordChecks.map((check, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 text-xs ${
                                check.met
                                  ? "text-emerald-600"
                                  : "text-surface-400"
                              }`}
                            >
                              {check.met ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5" />
                              )}
                              <span>{check.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className={`w-full px-3 py-3 border border-surface-200 rounded-lg text-sm text-surface-900 bg-white transition-all focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none pl-10 pr-10 ${
                          errors.confirm_password
                            ? "border-red-300 focus:ring-red-100"
                            : ""
                        }`}
                        {...register("confirm_password", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirm_password && (
                      <p className="mt-1 text-xs text-red-500 font-medium">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {stepError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Please fix the highlighted fields before continuing.
                </span>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 pt-1">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-surface-600 hover:text-surface-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r  from-primary-600 to-secondary-600 text-white font-semibold rounded-xl
                  hover:opacity-90 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary-500/25"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : currentStep < STEPS.length ? (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
