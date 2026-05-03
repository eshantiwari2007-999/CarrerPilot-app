
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App.tsx";
import "./styles/index.css";
import { AuthProvider } from "./app/contexts/AuthContext";
import { Toaster } from "sonner";

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </BrowserRouter>
);