import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { QueryProvider } from "./providers/QueryProvider.tsx";
import "./index.css";

// Initialize theme
function initializeTheme() {
  const savedTheme = localStorage.getItem("galaxia-theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const theme = savedTheme || systemTheme;
  
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
}

// Initialize theme before rendering
initializeTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>,
);
