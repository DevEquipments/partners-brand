import { useState } from "react";
import { MapPin, Plus, Trash2, Globe } from "lucide-react";
import { ALL_STATES, getCitiesForState } from "../../config/locations";
import SearchableSelect from "../common/SearchableSelect";
import MultiSelect from "../common/MultiSelect";

export const LocationSelector = ({
  locations = [],
  onChange,
  disabled = false,
  error,
}) => {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCities, setSelectedCities] = useState([]);

  const stateOptions = ALL_STATES.map((state) => ({
    value: state,
    label: state,
  }));

  const availableCities = selectedState ? getCitiesForState(selectedState) : [];
  const cityOptions = [
    { value: "ALL", label: "All Cities / Statewide" },
    ...availableCities.map((city) => ({
      value: city,
      label: city,
    })),
  ];

  const handleStateChange = (stateVal) => {
    setSelectedState(stateVal);
    setSelectedCities(["ALL"]);
  };

  const handleAddLocation = () => {
    if (!selectedState) return;

    // Check if state is already added
    const existingIndex = locations.findIndex(
      (l) => (l.state || "").toLowerCase() === selectedState.toLowerCase()
    );

    let updatedLocations;
    const citiesToAssign =
      selectedCities.length === 0 || selectedCities.includes("ALL")
        ? []
        : selectedCities;

    if (existingIndex >= 0) {
      updatedLocations = [...locations];
      updatedLocations[existingIndex] = {
        state: selectedState,
        cities: citiesToAssign,
      };
    } else {
      updatedLocations = [
        ...locations,
        {
          state: selectedState,
          cities: citiesToAssign,
        },
      ];
    }

    onChange(updatedLocations);
    setSelectedState(null);
    setSelectedCities([]);
  };

  const handleRemoveLocation = (indexToRemove) => {
    if (disabled) return;
    const updated = locations.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {!disabled && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>Add Location Coverage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-5">
              <SearchableSelect
                label="Select State"
                placeholder="Choose State..."
                options={stateOptions}
                value={selectedState}
                onChange={handleStateChange}
                isClearable={false}
              />
            </div>

            <div className="sm:col-span-5">
              <MultiSelect
                label="Select Cities"
                placeholder={selectedState ? "All cities or select..." : "Select state first"}
                options={cityOptions}
                value={selectedCities}
                onChange={(cities) => {
                  if (cities.includes("ALL") && !selectedCities.includes("ALL")) {
                    setSelectedCities(["ALL"]);
                  } else if (cities.includes("ALL") && cities.length > 1) {
                    setSelectedCities(cities.filter((c) => c !== "ALL"));
                  } else {
                    setSelectedCities(cities);
                  }
                }}
                isDisabled={!selectedState}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddLocation}
                disabled={!selectedState}
                className="w-full h-10 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Configured Locations List */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Assigned Locations ({locations.length})</span>
          {locations.length === 0 && (
            <span className="text-amber-500 font-medium normal-case">No locations assigned yet</span>
          )}
        </p>

        {locations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {loc.state}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-5">
                    {!loc.cities || loc.cities.length === 0
                      ? "Entire State (All Cities & Districts)"
                      : loc.cities.join(", ")}
                  </p>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(idx)}
                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Remove location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;
