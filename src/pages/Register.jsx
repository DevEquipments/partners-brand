import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authApi";
import { getPremiumBrandsList } from "../services/premiumBrands";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Textarea from "../components/common/Textarea";
import ThemeToggle from "../components/layout/ThemeToggle";
import toast from "react-hot-toast";
import { Building2, User, Lock, Mail, Phone, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";

const STEPS = [
  { id: 1, title: "Business Information", fields: ["brand_name", "company_name", "gst", "office_address"] },
  { id: 2, title: "Contact Credentials", fields: ["username", "email", "phone_no"] },
  { id: 3, title: "Account Security", fields: ["password", "confirm_password"] },
];

export const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandsList, setBrandsList] = useState([]);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  useEffect(() => {
    let active = true;
    const fetchBrands = async () => {
      try {
        const res = await getPremiumBrandsList({ brand_name: brandSearch });
        if (active && res?.data && Array.isArray(res.data)) {
          setBrandsList(res.data);
        }
      } catch {
        // Dropdown fallback
      }
    };
    if (isBrandDropdownOpen) {
      const timer = setTimeout(fetchBrands, 300);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [brandSearch, isBrandDropdownOpen]);

  const handleNext = async () => {
    const fieldsToValidate = STEPS[currentStep - 1].fields;
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        brand_name: data.brand_name,
        company_name: data.company_name,
        office_address: data.office_address,
        phone_no: data.phone_no,
        gst: data.gst,
        email: data.email,
        username: data.username,
        password: data.password,
      };

      const response = await registerUser(payload);
      toast.success(response?.message || "Registration completed successfully.");

      const token = response.token || response.data?.token;
      const user = response.data || response.user;

      if (token) {
        login(token, user);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (error) {
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "Registration failed. Please check form details.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 md:p-10 animate-scale-in">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center p-1 shadow-sm">
              <img src={logo} alt="EquipmentsDekho" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-sm font-bold uppercase tracking-tight block">
                Brand Partner Onboarding
              </span>
              <span className="text-[11px] text-slate-500 block">
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                step.id <= currentStep ? "bg-orange-600" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative">
                <Input
                  label="Brand Name"
                  placeholder="e.g. Caterpillar, JCB, Tata Hitachi"
                  icon={Building2}
                  error={errors.brand_name?.message}
                  {...register("brand_name", { required: "Brand name is required" })}
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setValue("brand_name", e.target.value, { shouldValidate: true });
                    setIsBrandDropdownOpen(true);
                  }}
                  onFocus={() => setIsBrandDropdownOpen(true)}
                />
                {isBrandDropdownOpen && brandsList.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg shadow-lg">
                    {brandsList.map((item, idx) => {
                      const name = item.brand_name || item.name || String(item);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setBrandSearch(name);
                            setValue("brand_name", name, { shouldValidate: true });
                            setIsBrandDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Input
                label="Legal Company Name"
                placeholder="e.g. Equipment Partner India Pvt Ltd"
                icon={Building2}
                error={errors.company_name?.message}
                {...register("company_name", { required: "Company name is required" })}
              />

              <Input
                label="GST Number"
                placeholder="15-character GSTIN"
                icon={FileText}
                error={errors.gst?.message}
                {...register("gst", {
                  required: "GST number is required",
                  pattern: {
                    value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                    message: "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
                  },
                })}
              />

              <Textarea
                label="Office Address"
                placeholder="Full corporate or registered office address"
                rows={2}
                error={errors.office_address?.message}
                {...register("office_address", { required: "Office address is required" })}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <Input
                label="Username"
                placeholder="Choose a unique username"
                icon={User}
                error={errors.username?.message}
                {...register("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="contact@brandpartner.com"
                icon={Mail}
                error={errors.email?.message}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Valid email is required",
                  },
                })}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="10-digit mobile number"
                icon={Phone}
                error={errors.phone_no?.message}
                {...register("phone_no", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit mobile number",
                  },
                })}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                icon={Lock}
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                icon={Lock}
                error={errors.confirm_password?.message}
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (val) => val === getValues("password") || "Passwords do not match",
                })}
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" size="md" icon={ArrowLeft} onClick={handleBack}>
                Back
              </Button>
            ) : (
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                Already registered? Sign in
              </Link>
            )}

            {currentStep < STEPS.length ? (
              <Button type="button" variant="primary" size="md" icon={ArrowRight} iconPosition="right" onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Complete Registration
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
