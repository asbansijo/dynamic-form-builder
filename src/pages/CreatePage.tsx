import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import {
  setName,
  addField,
  updateField,
  deleteField,
  reorderFields,
  reset,
} from "../slices/formSlice";
import {
  TextField,
  Button,
  Box,
  Paper,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import SaveIcon from "@mui/icons-material/Save";
import { FormSchema, FieldSchema } from "../types";
import { saveForm } from "../utils/localStorage";
import { v4 as uuidv4 } from "uuid";

/**
 * CreatePage handles adding fields, editing basic props inline,
 * reordering and saving the schema to localStorage.
 */
export default function CreatePage() {
  // grab state from redux
  const { name, fields } = useSelector((s: RootState) => s.form);
  const dispatch = useDispatch();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState(name);

  // quick add a field using defaults
  const quickAdd = (type: FieldSchema["type"]) => {
    // dispatch addField with basic defaults
    dispatch(
      addField({
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} field`,
      })
    );
  };

  // save current schema to localStorage
  const handleSave = () => {
    const schema: FormSchema = {
      id: uuidv4(),
      name: saveName || "Untitled form",
      createdAt: new Date().toISOString(),
      fields,
    };
    saveForm(schema);
    setSaveDialogOpen(false);
    // reset builder after save so user knows it persisted
    dispatch(reset());
    alert("Form saved to localStorage");
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* form name */}
        <TextField
          label="Form Name"
          value={name}
          onChange={(e) => dispatch(setName(e.target.value))}
          fullWidth
          margin="normal"
          // small explanatory helper text
          helperText="This is the name saved to localStorage with the schema."
        />

        {/* Quick-add field buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("text")}>Add Text</Button>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("number")}>Add Number</Button>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("textarea")}>Add Textarea</Button>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("select")}>Add Select</Button>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("radio")}>Add Radio</Button>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("checkbox")}>Add Checkbox</Button>
          <Button sx={{ color: "#000"}} onClick={() => quickAdd("date")}>Add Date</Button>
        </Box>

        {/* list of fields with simple inline editing */}
        <List>
          {fields.map((f, idx) => (
            <ListItem key={f.id} sx={{ mb: 1 }} component={Paper}>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      label="Label"
                      value={f.label}
                      onChange={(e) =>
                        dispatch(updateField({ id: f.id, data: { label: e.target.value } }))
                      }
                      size="small"
                    />
                    <Select
                      value={f.type}
                      onChange={(e) =>
                        dispatch(updateField({ id: f.id, data: { type: e.target.value as any } }))
                      }
                      size="small"
                    >
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="textarea">Textarea</MenuItem>
                      <MenuItem value="select">Select</MenuItem>
                      <MenuItem value="radio">Radio</MenuItem>
                      <MenuItem value="checkbox">Checkbox</MenuItem>
                      <MenuItem value="date">Date</MenuItem>
                    </Select>

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={f.required}
                          onChange={(e) =>
                            dispatch(updateField({ id: f.id, data: { required: e.target.checked } }))
                          }
                        />
                      }
                      label="Required"
                    />
                  </Box>
                }
                secondary={
                  // show minimal field metadata
                  <>
                    <small>Type: {f.type} • Derived: {f.derived ? "yes" : "no"}</small>
                  </>
                }
              />

              {/* reorder and delete actions */}
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => dispatch(reorderFields({ from: idx, to: Math.max(0, idx - 1) }))}
                >
                  <ArrowUpward />
                </IconButton>
                <IconButton
                  onClick={() => dispatch(reorderFields({ from: idx, to: Math.min(fields.length - 1, idx + 1) }))}
                >
                  <ArrowDownward />
                </IconButton>
                <IconButton onClick={() => dispatch(deleteField(f.id))}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* Save button */}
        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Button sx= {{backgroundColor: "#000"}}
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              setSaveName(name);
              setSaveDialogOpen(true);
            }}
          >
            Save Form
          </Button>

        </Box>
      </Paper>

      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            label="Form name to save as"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 1 }}>
            <small>Note: only schema is saved. No user-submitted data is stored.</small>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
