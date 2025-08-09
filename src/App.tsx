// App.tsx - Router and main layout
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import PreviewPage from "./pages/PreviewPage";
import MyFormsPage from "./pages/MyFormsPage";
import { AppBar, Toolbar, Button, Container } from "@mui/material";

function App() {
  return (
    // provide redux store to the tree
    <Provider store={store}>
      <BrowserRouter>
        {/* top nav */}
        <AppBar position="static"  sx={{ backgroundColor: "#ffffffff",  }}>
          <Toolbar>
            <Button color="inherit" component={Link} to="/create" sx={{color: "#000", fontSize:"16px" }}>
              Create
            </Button>
            <Button color="inherit" component={Link} to="/preview" sx={{color: "#000", fontSize:"16px" }}>
              Preview
            </Button>
            <Button color="inherit" component={Link} to="/myforms" sx={{color: "#000", fontSize:"16px" }}>
              My Forms
            </Button>
          </Toolbar>
        </AppBar>

        {/* main content */}
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<CreatePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/preview/:id" element={<PreviewPage />} />
            <Route path="/myforms" element={<MyFormsPage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
