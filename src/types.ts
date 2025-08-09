// types.ts - shared types for forms/fields

// Allowed field types
export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

// Validation options for a single field
export interface ValidationRule {
  // require not empty
  required?: boolean;
  // min/max length (for text)
  minLength?: number | null;
  maxLength?: number | null;
  // simple email validation
  email?: boolean;
  // custom password rule flag (we'll test min8 + contains number)
  passwordRule?: boolean;
}

// Single field schema
export interface FieldSchema {
  id: string; // unique id
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select/radio/checkbox
  validation?: ValidationRule;
  // derived field properties
  derived?: boolean;
  parents?: string[]; // parent field ids
  formula?: string; // user provided expression (e.g., "calcAge(dob)")
  // order hint used for reordering
  order: number;
}

// full form schema stored in localStorage
export interface FormSchema {
  id: string;
  name: string;
  createdAt: string; // ISO date
  fields: FieldSchema[];
}
