// localStorage helpers for storing form schemas
import { FormSchema } from "../types";

// storage key
const KEY = "saved_forms_v1";

// load all saved forms
export function loadAllForms(): FormSchema[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FormSchema[];
  } catch {
    return [];
  }
}

// save a single form (schema only) - will append
export function saveForm(schema: FormSchema) {
  const all = loadAllForms();
  all.push(schema);
  localStorage.setItem(KEY, JSON.stringify(all));
}

// find by id
export function loadFormById(id: string): FormSchema | undefined {
  return loadAllForms().find((f) => f.id === id);
}

//exit