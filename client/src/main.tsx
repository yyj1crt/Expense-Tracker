import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Handle unhandled promise rejections from form validation
window.addEventListener("unhandledrejection", (event) => {
  // Only log non-validation errors
  if (event.reason?.name !== "ZodError") {
    console.error("Unhandled promise rejection:", event.reason);
  }
  // Prevent default error handling for ZodError validation messages
  if (event.reason?.name === "ZodError") {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
