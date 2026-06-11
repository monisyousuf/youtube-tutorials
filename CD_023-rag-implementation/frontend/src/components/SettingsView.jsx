import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useSettings } from "../App.jsx";

export default function SettingsView() {
  const { llmProvider, apiKeys, setSettings } = useSettings();

  const [localProvider, setLocalProvider] = useState(llmProvider);
  const [localKey, setLocalKey] = useState(apiKeys[llmProvider] || "");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleProviderChange(newProvider) {
    setLocalProvider(newProvider);
    setLocalKey(apiKeys[newProvider] || "");
    setShowKey(false);
  }

  function handleSave() {
    setSettings({
      llmProvider: localProvider,
      apiKeys: { ...apiKeys, [localProvider]: localKey },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex items-start justify-center h-full p-8 overflow-y-auto bg-vsc-bg">
      <div className="w-full max-w-[480px] bg-vsc-surface border border-vsc-border rounded-lg p-8">
        <h2 className="font-heading text-xl font-semibold text-vsc-text mb-5 tracking-wide">
          Settings
        </h2>

        {/* Privacy callout */}
        <div className="bg-green-900/30 border border-green-700/50 rounded px-4 py-3 font-body text-sm text-green-400 mb-6 leading-relaxed">
          Your API key is used only during this session to call the selected LLM provider. It is
          never stored, logged, or sent anywhere other than the provider's API.
        </div>

        <div className="flex flex-col gap-5">
          {/* Provider */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-vsc-muted">LLM Provider</label>
            <select
              value={localProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="bg-vsc-input border border-vsc-border text-vsc-text font-body rounded px-3 py-2 text-sm outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
            </select>
          </div>

          {/* API Key */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-vsc-muted">API Key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 bg-vsc-input border border-vsc-border text-vsc-text font-body rounded px-3 py-2 text-sm outline-none focus:border-accent transition-colors placeholder:text-vsc-muted"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="px-2.5 bg-vsc-input border border-vsc-border text-vsc-muted hover:text-vsc-text rounded transition-colors"
                title={showKey ? "Hide" : "Show"}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-vsc-btn text-white rounded text-sm font-body font-medium hover:bg-vsc-btnHover transition-colors"
          >
            {saved ? "Saved ✓" : "Save"}
          </button>

          <p className="font-body text-[11px] text-vsc-muted/50 text-center leading-relaxed">
            Stored in memory only. NEVER written to disk, server, or localStorage.
            Cleared automatically when you close or refresh this tab.
          </p>
        </div>
      </div>
    </div>
  );
}
