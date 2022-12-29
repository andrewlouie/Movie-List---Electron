import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Labels } from '../types/types';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export interface MultiSelectProps {
  labels: Labels;
  updateLabels: (labels: string[]) => void;
  currentTitle: string;
}

const filter = createFilterOptions<string>();

function MultiSelect(props: MultiSelectProps) {
  const {
    labels,
    currentTitle,
    updateLabels,
  } = props;

  const values = labels[currentTitle] || [];

  const removeAdd = (val: string) => {
    if (val.startsWith("Add ")) {
      return val.substring(5, val.length - 1);
    }
    return val;
  }

  return (
    <Autocomplete
      multiple
      value={values}
      options={[...new Set([...Object.values(labels).flat(), ...values])]}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option);
        if (inputValue !== '' && !isExisting) {
          filtered.push(`Add "${inputValue}"`);
        }

        return filtered;
      }}
      disableCloseOnSelect
      freeSolo
      onChange={(evt, newValues) => {
        updateLabels(newValues.map(removeAdd))
      }}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option}
        </li>
      )}
      style={{ width: 500 }}
      renderInput={(params) => (
        <TextField {...params} label="Labels" placeholder="" />
      )}
    />
  );
}

export default MultiSelect;
