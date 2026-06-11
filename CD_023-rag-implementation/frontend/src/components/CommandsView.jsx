import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

const COMMANDS = [
  {
    heading: "Connect Directly To Database",
    description:
      "Connect directly to the database from terminal. Make sure that your docker container (`cd_023-rag-implementation-database-1`) is running.",
    command:
      "docker exec -it cd_023-rag-implementation-database-1 psql postgresql://raguser:ragpassword@database:5432/ragdb",
  },
  {
    heading: "View Embeddings",
    description:
      "Use this SQL Query to view data in database (Concise View)",
    command:
      "select id, source, section_id, section_hash from documents;",
  },
];

function CommandCard({ heading, description, command }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-vsc-surface border border-vsc-border rounded-lg p-5">
      <h3 className="font-heading text-base font-semibold text-vsc-text mb-1">{heading}</h3>
      <p className="font-body text-sm text-vsc-muted mb-3 leading-relaxed">{description}</p>
      <div className="flex items-center gap-3 bg-vsc-input border border-vsc-border rounded px-4 py-2.5">
        <code className="font-mono text-xs text-vsc-text flex-1 break-all leading-relaxed select-all">
          {command}
        </code>
        <button
          onClick={handleCopy}
          title="Copy command"
          className="shrink-0 text-vsc-muted hover:text-vsc-text transition-colors"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function CommandsView() {
  return (
    <div className="flex items-start justify-center h-full p-8 overflow-y-auto bg-vsc-bg">
      <div className="w-full max-w-[640px]">
        <h2 className="font-heading text-xl font-semibold text-vsc-text mb-6 tracking-wide">
          Common Commands
        </h2>
        <div className="flex flex-col gap-4">
          {COMMANDS.map((cmd, i) => (
            <CommandCard key={i} {...cmd} />
          ))}
        </div>
      </div>
    </div>
  );
}
