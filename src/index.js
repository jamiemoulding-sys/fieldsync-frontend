import "leaflet/dist/leaflet.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

/* OPTIONAL GLOBAL IMPORTS */
// import "./styles/theme.css";

const root =
  ReactDOM.createRoot(
    document.getElementById(
      "root"
    )
  );

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);