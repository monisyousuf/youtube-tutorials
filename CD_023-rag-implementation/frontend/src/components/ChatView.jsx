import { ArrowUp, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useSettings } from "../App.jsx";

// ─── Mode selector ────────────────────────────────────────────────────────────

const MODE_OPTIONS = [
  {
    value: "stateless",
    label: "Stateless",
    sub: "Each question is independent — no memory of prior turns.",
  },
  {
    value: "conversational",
    label: "Conversational",
    sub: "Keeps history and rewrites follow-up questions for retrieval.",
  },
];

function ModeSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = MODE_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2 py-1 rounded font-body text-xs text-vsc-muted hover:bg-vsc-input hover:text-vsc-text transition-colors duration-150"
      >
        {current.label}
        <ChevronDown
          size={10}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Panel — opens upward */}
          <div className="absolute bottom-full mb-2 right-0 z-20 w-72 bg-vsc-surface border border-vsc-border rounded-xl shadow-2xl overflow-hidden">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 transition-colors duration-100 hover:bg-vsc-elevated
                  ${opt.value === value ? "bg-vsc-elevated" : ""}
                `}
              >
                <div className="text-sm font-medium text-vsc-text">{opt.label}</div>
                <div className="text-xs text-vsc-muted mt-0.5 leading-relaxed">{opt.sub}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ borderRadius: "8px", margin: "0.75rem 0", border: "1px solid #454545" }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

// ─── Loading dots ─────────────────────────────────────────────────────────────

function LoadingDots() {
  return (
    <div className="flex items-center gap-[5px] py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-[5px] h-[5px] rounded-full bg-accent"
          style={{
            animation: "pulse-wave 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

function ApiKeyModal({ onClose, onGoToSettings }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-vsc-surface border border-vsc-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="font-heading text-base font-semibold text-vsc-text mb-2">
          API Key Required
        </h3>
        <p className="font-body text-sm text-vsc-muted leading-relaxed mb-5">
          An API key is required to use the chat functionality. Please add one in Settings before sending a message.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-vsc-input border border-vsc-border text-vsc-muted hover:text-vsc-text rounded text-sm font-body transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={onGoToSettings}
            className="px-4 py-2 bg-vsc-btn hover:bg-vsc-btnHover text-white rounded text-sm font-body transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatView() {
  const { llmProvider, apiKey, navigate } = useSettings();

  const [mode, setMode] = useState("stateless");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  // Clear API history when switching to stateless (messages display stays intact)
  useEffect(() => {
    if (mode === "stateless") setConversationHistory([]);
  }, [mode]);

  // Auto-scroll to bottom when messages update or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || loading) return;

    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_prompt: prompt,
          rag_type: mode,
          history: mode === "conversational" ? conversationHistory : [],
          llm_provider: llmProvider,
          api_key: apiKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `**Error:** ${data.detail || "Unknown error"}` },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        if (mode === "conversational") setConversationHistory(data.history);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Error:** ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const noApiKey = !apiKey;
  const canSend = input.trim().length > 0 && !loading;
  const hasMessages = messages.length > 0;

  const providerLabel = llmProvider === "anthropic" ? "Anthropic (Claude)" : "OpenAI (GPT)";

  return (
    <div className="relative flex flex-col h-full bg-vsc-bg overflow-hidden">

      {/* Floating status badge — no header bar, just a pill in the top-right corner */}
      <div className="absolute top-3 right-4 z-10">
        {noApiKey ? (
          <button
            onClick={() => navigate("settings")}
            className="font-body text-[11px] text-[#e07040]/90 bg-[#e07040]/10 border border-[#e07040]/25 rounded-full px-3 py-1 hover:bg-[#e07040]/15 transition-colors cursor-pointer"
          >
            No API key — go to Settings
          </button>
        ) : (
          <button
            onClick={() => navigate("settings")}
            className="font-body text-[11px] text-green-400/80 bg-green-900/20 border border-green-700/30 rounded-full px-3 py-1 hover:bg-green-900/30 transition-colors cursor-pointer"
          >
            {providerLabel} Selected &nbsp;·&nbsp; Change in Settings
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-vsc-bg">
        {!hasMessages ? (
          /* Welcome screen */
          <div className="flex items-center justify-center h-full">
            <div className="text-center select-none px-6">
              <h1 className="font-heading text-4xl font-bold text-vsc-text mb-3 tracking-tight">
                Miniature RAG System
              </h1>
              <p className="font-body text-sm text-vsc-muted leading-relaxed">
                by{" "}
                <a
                  href="https://monis.yt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Monis Yousuf
                </a>
                . See more deep dives like this on{" "}
                <a
                  href="https://monis.yt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#ff0000] hover:underline"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style={{ display: "inline", verticalAlign: "middle" }}>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Youtube
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

            {messages.map((msg, i) =>
              msg.role === "user" ? (
                /* User bubble — right-aligned */
                <div key={i} className="flex justify-end">
                  <div className="bg-[#1e2d3f] text-[#c0d0e0] font-body text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[78%] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* Assistant response — left-aligned prose */
                <div key={i} className="prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )
            )}

            {/* Loading indicator appears after the last user message */}
            {loading && <LoadingDots />}

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="shrink-0 px-6 py-4 bg-vsc-bg">
        <div className="chat-input-wrapper max-w-3xl mx-auto">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            className="w-full resize-none bg-transparent outline-none font-body text-sm text-vsc-text placeholder:text-vsc-muted/60 max-h-36 px-4 pt-3 pb-2"
          />

          {/* Divider */}
          <div className="mx-3 border-t border-vsc-border/50" />

          {/* Toolbar */}
          <div className="flex items-center justify-end gap-2 px-3 py-2">
            <ModeSelector value={mode} onChange={setMode} />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`
                w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150
                ${canSend
                  ? "bg-accent hover:bg-accent-hover text-white"
                  : "bg-vsc-input text-vsc-muted opacity-35 cursor-not-allowed"
                }
              `}
            >
              <ArrowUp size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <p className="text-center font-body text-[10px] text-vsc-muted/40 mt-1.5 select-none">
          Enter to Send &nbsp;·&nbsp; Shift+Enter · new line
        </p>
      </div>

      {showApiKeyModal && (
        <ApiKeyModal
          onClose={() => setShowApiKeyModal(false)}
          onGoToSettings={() => { setShowApiKeyModal(false); navigate("settings"); }}
        />
      )}
    </div>
  );
}
