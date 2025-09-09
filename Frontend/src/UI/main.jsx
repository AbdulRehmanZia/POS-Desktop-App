import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import UserContextProvider from "../context/UserContext.jsx";
import StoreContextProvider from "../context/StoreContext.jsx";

import { HashRouter as Router } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <Router>
    <UserContextProvider>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </UserContextProvider>
  </Router>
);


