import Select from "react-select";

/**
 * Shared MultiSelect wrapper for Equipments Dekho Partner Admin.
 * Styled with Orange (#ea580c / #f97316) and Slate enterprise theme.
 */
export const MultiSelect = ({
  label,
  error,
  options = [],
  value = [],
  onChange,
  placeholder = "Select multiple options...",
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  containerClassName = "",
  className = "",
  id,
  name,
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  // Normalize selected values array for react-select
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleChange = (selected) => {
    const rawValues = (selected || []).map((opt) => opt.value);
    onChange(rawValues, selected);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none"
        >
          {label}
        </label>
      )}
      <Select
        isMulti
        id={selectId}
        name={name}
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        classNamePrefix="eq-multiselect"
        unstyled
        classNames={{
          control: ({ isFocused, isDisabled: disabled }) =>
            `min-h-10 px-3 py-1 text-xs bg-white dark:bg-slate-900 border rounded-lg transition-all shadow-xs flex items-center justify-between cursor-pointer ${
              disabled
                ? "opacity-60 bg-slate-100 dark:bg-slate-800 cursor-not-allowed border-slate-200 dark:border-slate-800"
                : error
                ? "border-red-400 dark:border-red-500 ring-1 ring-red-400/20"
                : isFocused
                ? "border-orange-500 ring-2 ring-orange-500/20 dark:border-orange-500"
                : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
            } ${className}`,
          placeholder: () => "text-slate-400 dark:text-slate-500",
          multiValue: () =>
            "bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 rounded-md px-2 py-0.5 m-0.5 text-xs font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-1",
          multiValueLabel: () => "text-orange-900 dark:text-orange-200 text-[11px]",
          multiValueRemove: () =>
            "text-orange-600 dark:text-orange-400 hover:text-red-500 rounded p-0.5 cursor-pointer",
          input: () => "text-slate-900 dark:text-slate-100 text-xs m-0",
          menu: () =>
            "mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden z-50 text-xs",
          menuList: () => "p-1 max-h-60 overflow-y-auto space-y-0.5",
          option: ({ isFocused, isSelected }) =>
            `px-3 py-2 rounded-md transition-colors cursor-pointer text-xs ${
              isSelected
                ? "bg-orange-600 text-white font-semibold"
                : isFocused
                ? "bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`,
          noOptionsMessage: () => "p-3 text-center text-slate-400 text-xs",
          clearIndicator: () => "p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer",
          dropdownIndicator: () => "p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer",
          indicatorSeparator: () => "hidden",
        }}
      />
      {error && (
        <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect;
