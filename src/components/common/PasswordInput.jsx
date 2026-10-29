import { forwardRef, useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Input from "./Input";

export const PasswordInput = forwardRef(
  (
    {
      label = "Password",
      icon = Lock,
      showPassword: externalShowPassword,
      onToggleShowPassword,
      placeholder = "••••••••",
      autoComplete = "current-password",
      ...props
    },
    ref
  ) => {
    const [internalShowPassword, setInternalShowPassword] = useState(false);

    const isControlled = externalShowPassword !== undefined;
    const isVisible = isControlled ? externalShowPassword : internalShowPassword;

    const handleToggle = () => {
      if (onToggleShowPassword) {
        onToggleShowPassword(!isVisible);
      }
      if (!isControlled) {
        setInternalShowPassword((prev) => !prev);
      }
    };

    return (
      <Input
        ref={ref}
        type={isVisible ? "text" : "password"}
        label={label}
        icon={icon}
        endIcon={isVisible ? EyeOff : Eye}
        onEndIconClick={handleToggle}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
