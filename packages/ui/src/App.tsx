/**
 * BillClaw UI - Main App Component
 *
 * Router setup for OAuth and configuration pages.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PlaidConnectPage } from "@/components/pages/PlaidConnectPage"
import { GmailConnectPage } from "@/components/pages/GmailConnectPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connect/plaid" element={<PlaidConnectPage />} />
        <Route path="/connect/gmail" element={<GmailConnectPage />} />
        <Route path="/gmail-callback" element={<GmailConnectPage />} />
      </Routes>
    </BrowserRouter>
  )
}

// Placeholder home page - will be replaced with config page in future tasks
function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">BillClaw UI</h1>
        <p className="text-gray-600 mt-2">Configuration interface</p>
      </div>
    </div>
  )
}
