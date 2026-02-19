// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ✅ यह basename बिल्कुल vite.config.js में base से मेल खाना चाहिए */}
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
