import LocationSelector from "./LocationSelector";

export const TerritorySelector = (props) => {
  return <LocationSelector locations={props.territories || props.locations} onChange={props.onChange} disabled={props.disabled} error={props.error} />;
};

export default TerritorySelector;
