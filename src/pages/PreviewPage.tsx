import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { loadFormById } from "../utils/localStorage";
import { useParams } from "react-router-dom";
import { Box, Paper, Button, Typography } from "@mui/material";
import FormRenderer from "../renderer/FormRenderer";
import { FormSchema } from "../types";


export default function PreviewPage() {
  const { id } = useParams<{ id?: string }>();
  const builder = useSelector((s: RootState) => s.form);
  const [schema, setSchema] = useState<FormSchema | null>(null);

  useEffect(() => {
    if (id) {
      // load saved form
      const found = loadFormById(id);
      setSchema(found ?? null);
    } else {
      // build a runtime schema from in-memory builder
      setSchema({
        id: "preview-temp",
        name: builder.name,
        createdAt: new Date().toISOString(),
        fields: builder.fields,
      });
    }
  }, [id, builder]);

  if (!schema) {
    return <Typography>No form found to preview.</Typography>;
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Preview: {schema.name}</Typography>
        <Typography variant="caption">Created: {new Date(schema.createdAt).toLocaleString()}</Typography>
      </Paper>
      {/* renderer handles state, validation & derived fields */}
      <FormRenderer schema={schema} />
      <Box sx={{ mt: 2 }}>
        <Button sx={{ color: "#000" }} onClick={() => (window.location.href = "/create")}>Back to Builder</Button>
      </Box>
    </Box>
  );
}
