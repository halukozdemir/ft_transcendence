import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router/dom";

import "./styles/globals.css";
import router from "./routes";

createRoot(document.getElementById('root')!).render(
  <div className="w-full h-screen flex justify-center bg-bg">
    <div className="w-full max-w-[1440px] h-full">
      <RouterProvider router={router} />
    </div>
  </div>
)