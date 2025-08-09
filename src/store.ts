// store.ts - redux toolkit store config
import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./slices/formSlice";

// Create store with a single slice for current working schema
export const store = configureStore({
  reducer: {
    form: formReducer,
  },
});

// Infer types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
