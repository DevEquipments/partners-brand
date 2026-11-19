import { useState } from "react";
import { Lock, KeyRound, Copy, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export const SubAdminPasswordModal = ({
  isOpen,
  onClose,
  subAdmin,
  onSavePassword,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!subAdmin) return null;

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setConfirmPassword(gen);
    setError("");
    toast.success("Generated strong temporary password.");
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Password copied to clipboard.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSavePassword) {
        await onSavePassword(subAdmin, password);
      }
      toast.success(`Password for @${subAdmin.username} updated successfully.`);
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Operator Password"
      subtitle={`Reset and re-issue login credentials for @${subAdmin.username}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">
              Account Operator
            </p>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              @{subAdmin.username}
            </p>
          </div>
          <button
            type="button"
            onClick={generateRandomPassword}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Strong</span>
          </button>
        </div>

        {/* New Password Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>New Password *</span>
            </span>
            {password && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Min. 6 characters"
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Confirm New Password *</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            placeholder="Re-enter new password"
            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 font-mono"
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-500 font-medium">{error}</p>
        )}

        <p className="text-[11px] text-slate-400 leading-relaxed">
          The operator will be required to log in with this updated password on their next session.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SubAdminPasswordModal;
