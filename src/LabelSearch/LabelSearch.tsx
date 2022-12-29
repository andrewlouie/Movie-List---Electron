import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Labels } from "../types/types";

interface LabelSearchProps {
  labels: Labels;
  labelSearchValue: string[];
  setLabelSearchValue: Function;
}

function LabelSearch(props: LabelSearchProps) {
  const {
    labels,
    labelSearchValue,
    setLabelSearchValue,
  } = props;

  return (
    <Autocomplete
      multiple
      value={labelSearchValue}
      options={[...new Set([...Object.values(labels).flat()])]}
      onChange={(evt, newValue) => setLabelSearchValue(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          sx={{ width: "250px" }}
          label="Labels"
        />
      )}
    />
  );
}

export default LabelSearch;