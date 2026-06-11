import React, { createContext, useContext, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatView from "./components/ChatView.jsx";
import CommandsView from "./components/CommandsView.jsx";
import GraphView from "./components/GraphView.jsx";
import SettingsView from "./components/SettingsView.jsx";

export const SettingsContext = createContext({
  llmProvider: "anthropic",
  apiKey: "",
  apiKeys: { anthropic: "", openai: "" },
  setSettings: () => {},
  navigate: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export default function App() {
  const [activeView, setActiveView] = useState("chat");
  const [settings, setSettings] = useState({
    llmProvider: "anthropic",
    apiKeys: { anthropic: "", openai: "" },
  });

  const apiKey = settings.apiKeys[settings.llmProvider] || "";

  return (
    <SettingsContext.Provider value={{ ...settings, apiKey, setSettings, navigate: setActiveView }}>
      <div className="flex h-screen bg-vsc-bg">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 overflow-hidden bg-vsc-bg">
          {/* All views stay mounted — toggling display:none preserves their state */}
          <div className={`h-full ${activeView !== "chat"     ? "hidden" : ""}`}><ChatView /></div>
          <div className={`h-full ${activeView !== "graph"    ? "hidden" : ""}`}><GraphView /></div>
          <div className={`h-full ${activeView !== "commands" ? "hidden" : ""}`}><CommandsView /></div>
          <div className={`h-full ${activeView !== "settings" ? "hidden" : ""}`}><SettingsView /></div>
        </main>
      </div>
    </SettingsContext.Provider>
  );
}
