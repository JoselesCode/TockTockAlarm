import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
      <Toaster />
    </Providers>
  </React.StrictMode>
);