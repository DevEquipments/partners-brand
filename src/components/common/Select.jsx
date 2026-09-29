import { forwardRef } from "react";
import SearchableSelect from "./SearchableSelect";

export const Select = forwardRef(
  (
    {
      label,
      error,
      options = [],
      value,
      onChange,
      placeholder,
      isDisabled,
      disabled,
      isClearable = false,
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    // If onChange is expecting an event object, adapt it
    const handleChange = (selectedVal) => {
      if (!onChange) return;
      // Also pass standard synthetic-like target if needed
      onChange(selectedVal);
    };

    return (
      <SearchableSelect
        ref={ref}
        label={label}
        error={error}
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={isDisabled || disabled}
        isClearable={isClearable}
        containerClassName={containerClassName}
        {...props}
      />
    );
  }
);

Select.displayName = "Select";

export default Select;
