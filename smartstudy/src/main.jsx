import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Capacitor } from "@capacitor/core";

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
  document.body.classList.add("android");
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
