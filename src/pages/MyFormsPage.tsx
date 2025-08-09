import React from "react";
import { loadAllForms } from "../utils/localStorage";
import { List, ListItem, ListItemText, Paper, Button, Box } from "@mui/material";

/**
 * Lists forms saved in localStorage and allows opening them in /preview/:id
 */
export default function MyFormsPage() {
  const all = loadAllForms();

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <h3>Saved Forms</h3>
        <List>
          {all.length === 0 && <div>No forms saved yet.</div>}
          {all.map((f) => (
            <ListItem key={f.id} divider>
              <ListItemText primary={f.name} secondary={new Date(f.createdAt).toLocaleString()} />
              <Button sx={{ color: "#000", border: "1px solid #000",}} variant="outlined" onClick={() => (window.location.href = `/preview/${f.id}`)}>
                Open
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
