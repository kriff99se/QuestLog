import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Dette er appens startpunkt.
// Vi finder den tomme <div id="root"> fra index.html
// og beder React om at tegne <App /> ind i den.
const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
