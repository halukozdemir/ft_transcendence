import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router/dom";

import "./styles/globals.css";
import router from "./routes";
import { AuthProvider } from "./context/authContext";

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)