import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { AuthProvider } from "react-oauth2-code-pkce";

import "./index.css";
import App from "./App.jsx";
import { store } from "./store/store";
import { authConfig } from "./authConfig";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider authConfig={authConfig} loadingComponent={<div>Loading...</div>}>
      <Provider store={store}>
        <App />
      </Provider>
    </AuthProvider>
  </StrictMode>
);

