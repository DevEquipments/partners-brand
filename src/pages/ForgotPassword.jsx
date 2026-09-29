import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Mail } from "lucide-react";
import Button from "../components/common/Button";
import ThemeToggle from "../components/layout/ThemeToggle";
import logo from "../assets/logo.png";

export const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center p-1 shadow-sm">
              <img src={logo} alt="EquipmentsDekho" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Partner Portal
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center mx-auto mb-3 text-orange-600 dark:text-orange-400 shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Password Recovery
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated password reset API integration is currently in development.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Need access to your brand partner account?
          </p>
          <p>
            Self-service password reset endpoints are not yet provisioned on the partner API gateway. To reset or recover your credentials, please reach out to the Equipments Dekho Partner Operations Desk:
          </p>
          <div className="pt-2 flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400">
            <Mail className="w-4 h-4" />
            <a href="mailto:partners@equipmentsdekho.com" className="hover:underline">
              partners@equipmentsdekho.com
            </a>
          </div>
        </div>

        <Link to="/login" className="block">
          <Button variant="outline" size="md" className="w-full" icon={ArrowLeft}>
            Return to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
