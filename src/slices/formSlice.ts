import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FieldSchema } from "../types";
import { v4 as uuidv4 } from "uuid"; 

// state for the builder 
interface FormState {
  name: string;
  fields: FieldSchema[];
}

const initialState: FormState = {
  name: "Untitled form",
  fields: [], // start empty
};

const slice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload; // set form name
    },
    addField(state, action: PayloadAction<Partial<FieldSchema>>) {
      const base: FieldSchema = {
        id: uuidv4(),
        label: action.payload.label || "Untitled field",
        type: (action.payload.type as any) || "text",
        required: !!action.payload.required,
        defaultValue: action.payload.defaultValue ?? "",
        options: action.payload.options ?? [],
        validation: action.payload.validation ?? {},
        derived: action.payload.derived ?? false,
        parents: action.payload.parents ?? [],
        formula: action.payload.formula ?? "",
        order: state.fields.length + 1,
      };
      state.fields.push(base);
    },
    updateField(state, action: PayloadAction<{ id: string; data: Partial<FieldSchema> }>) {
      const idx = state.fields.findIndex((f) => f.id === action.payload.id);
      if (idx >= 0) {
        state.fields[idx] = { ...state.fields[idx], ...action.payload.data };
      }
    },
    deleteField(state, action: PayloadAction<string>) {
      state.fields = state.fields.filter((f) => f.id !== action.payload);
      // fix ordering
      state.fields.forEach((f, i) => (f.order = i + 1));
    },
    reorderFields(state, action: PayloadAction<{ from: number; to: number }>) {
      const { from, to } = action.payload;
      const arr = [...state.fields];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      arr.forEach((f, i) => (f.order = i + 1));
      state.fields = arr;
    },
    setFields(state, action: PayloadAction<FieldSchema[]>) {
      state.fields = action.payload;
    },
    reset(state) {
      state.name = "Untitled form";
      state.fields = [];
    },
  },
});

export const {
  setName,
  addField,
  updateField,
  deleteField,
  reorderFields,
  setFields,
  reset,
} = slice.actions;

export default slice.reducer;
