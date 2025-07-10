"use client";

import { Autocomplete, TextField } from "@mui/material";

interface CaseStatusAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}

export default function CaseStatusAutocomplete({
  value,
  onChange,
  options,
  disabled,
}: CaseStatusAutocompleteProps) {
  return (
    <Autocomplete
      freeSolo
      value={value}
      onChange={(e, newValue) => {
        if (typeof newValue === "string") {
          onChange(newValue);
        }
      }}
      inputValue={value}
      onInputChange={(e, newInputValue) => {
        onChange(newInputValue);
      }}
      options={options}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
         
          placeholder="Select or type status"
          size="small"
          fullWidth
        />
      )}
    />
  );
}
