import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/context/theme-context.tsx";
import { Provider } from "react-redux";
import { store } from "@/redux/store.ts";
import { AuthInitializer } from "./utils/auth-initializer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Provider store={store}>
          <AuthInitializer>
            <App />
          </AuthInitializer>
        </Provider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);