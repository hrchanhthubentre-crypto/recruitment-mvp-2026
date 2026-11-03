import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App";
import { StoreProvider } from "@/lib/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <HashRouter>
        <App />
      </HashRouter>
      <Toaster position="top-center" offset={56} toastOptions={{ style: { fontFamily: "var(--font-sans)", borderRadius: 12 } }} />
    </StoreProvider>
  </StrictMode>,
);
