import React, { useEffect, useMemo, useState } from "react";
import { FormSchema, FieldSchema } from "../types";
import {
  TextField,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Button,
  Typography,
} from "@mui/material";
import parseISO from "date-fns/parseISO";
import differenceInYears from "date-fns/differenceInYears";

function evaluateFormula(formula: string, values: Record<string, any>) {
  // helper functions accessible to formula
  const helpers = {
    calcAgeISO: (iso?: string) => {
      if (!iso) return null;
      try {
        const d = parseISO(iso);
        return differenceInYears(new Date(), d);
      } catch {
        return null;
      }
    },
  };

  // build function argument list and body
  const argNames = ["helpers", ...Object.keys(values)];
  // create body to return expression result
  const body = `return (${formula});`;
  try {
    // create a new function with argNames; pass helpers and values
    // eslint-disable-next-line no-new-func
    const fn = new Function(...argNames, body);
    const args = [helpers, ...Object.values(values)];
    return fn(...args);
  } catch (e) {
    // if formula invalid, return null and we can show error
    return null;
  }
}

// validation util - returns error message or empty string
function validateField(field: FieldSchema, value: any): string {
  const v = field.validation;
  if (!v) return "";
  if (v.required && (value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0))) {
    return "This field is required";
  }
  if (v.email && typeof value === "string") {
    // simple regex
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) return "Invalid email address";
  }
  if (v.minLength && typeof value === "string" && value.length < v.minLength) {
    return `Minimum length is ${v.minLength}`;
  }
  if (v.maxLength && typeof value === "string" && value.length > v.maxLength) {
    return `Maximum length is ${v.maxLength}`;
  }
  if (v.passwordRule && typeof value === "string") {
    const ok = value.length >= 8 && /\d/.test(value);
    if (!ok) return "Password must be at least 8 characters and include a number";
  }
  return "";
}

export default function FormRenderer({ schema }: { schema: FormSchema }) {
  // local form values map keyed by field id
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    schema.fields.forEach((f) => (initial[f.id] = f.defaultValue ?? (f.type === "checkbox" ? [] : "")));
    return initial;
  });

  // validation errors map
  const [errors, setErrors] = useState<Record<string, string>>({});

  // compute derived field values whenever parents or values change
  useEffect(() => {
    // find derived fields and evaluate
    schema.fields.forEach((field) => {
      if (field.derived && field.formula) {
        // provide a map of parentId -> parentValue accessible by parentId variable name in the expression
        const parentValues: Record<string, any> = {};
        (field.parents ?? []).forEach((pid) => {
          parentValues[pid] = values[pid];
        });

        // attempt evaluation; formula may reference helpers and parent variable names
        const result = evaluateFormula(field.formula!, parentValues);
        // update only if different
        setValues((prev) => {
          if (prev[field.id] === result) return prev;
          return { ...prev, [field.id]: result };
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.fields, values]);

  // handle single field change and run validation for it
  const handleChange = (id: string, v: any) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    // run validation for that field if exists
    const field = schema.fields.find((f) => f.id === id);
    if (field) {
      const err = validateField(field, v);
      setErrors((prev) => ({ ...prev, [id]: err }));
    }
  };

  // on submit: validate all fields
  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    schema.fields.forEach((f) => {
      const err = validateField(f, values[f.id]);
      if (err) newErrors[f.id] = err;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // all good — for assignment we don't store answers
      alert("Form is valid! (No submission storage in this assignment.)");
    } else {
      alert("Fix validation errors.");
    }
  };

  // helper render a single field
  const renderField = (field: FieldSchema) => {
    const val = values[field.id];

    switch (field.type) {
      case "text":
      case "number":
      case "date":
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
            value={val ?? ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            helperText={errors[field.id] || ""}
            error={!!errors[field.id]}
            InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
          />
        );
      case "textarea":
        return (
          <TextField
            fullWidth
            label={field.label}
            value={val ?? ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            helperText={errors[field.id] || ""}
            error={!!errors[field.id]}
            multiline
            rows={4}
          />
        );
      case "select":
        return (
          <TextField
            select
            fullWidth
            label={field.label}
            value={val ?? ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            helperText={errors[field.id] || ""}
            error={!!errors[field.id]}
          >
            {(field.options ?? []).map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        );
      case "radio":
        return (
          <FormControl component="fieldset" error={!!errors[field.id]}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup value={val ?? ""} onChange={(e) => handleChange(field.id, e.target.value)}>
              {(field.options ?? []).map((opt) => (
                <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
            {errors[field.id] && <Typography color="error">{errors[field.id]}</Typography>}
          </FormControl>
        );
      case "checkbox":
        // assume checkbox options - value is array of selected options
        const selected: string[] = Array.isArray(val) ? val : [];
        return (
          <FormControl component="fieldset" error={!!errors[field.id]}>
            <FormLabel component="legend">{field.label}</FormLabel>
            {(field.options ?? []).map((opt) => (
              <FormControlLabel
                key={opt}
                control={
                  <Checkbox
                    checked={selected.includes(opt)}
                    onChange={(e) => {
                      const next = e.target.checked ? [...selected, opt] : selected.filter((s) => s !== opt);
                      handleChange(field.id, next);
                    }}
                  />
                }
                label={opt}
              />
            ))}
            {errors[field.id] && <Typography color="error">{errors[field.id]}</Typography>}
          </FormControl>
        );
      default:
        return <div>Unsupported type</div>;
    }
  };

  return (
    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {schema.fields.map((f) => (
        <Box key={f.id} sx={{ p: 1, border: "1px solid #eee", borderRadius: 1 }}>
          {/* show derived badge */}
          <Box sx={{ mb: 1 }}>
            <strong>{f.label}</strong> {f.derived && <em>(derived)</em>}
          </Box>

          {renderField(f)}
        </Box>
      ))}

      <Box sx={{  display: "flex", gap: 1 }}>
        <Button sx={{ color: "#fff", backgroundColor: "#000", }} variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
        <Button sx={{ color: "#000" }}
          onClick={() => {
            // show current form values for debugging
            alert(JSON.stringify(values, null, 2));
          }}
        >
          Show Values
        </Button>
      </Box>
    </Box>
  );
}
