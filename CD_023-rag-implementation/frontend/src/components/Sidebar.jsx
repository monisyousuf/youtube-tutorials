import React, { useState } from "react";
import chatSvgRaw from "../assets/icons/chat.svg?raw";
import commandLineSvgRaw from "../assets/icons/command-line.svg?raw";
import settingsSvgRaw from "../assets/icons/settings.svg?raw";
import vectorDbSvgRaw from "../assets/icons/vector-db.svg?raw";

function SvgIcon({ raw, size }) {
  const sized = raw
    .replace('width="512"', `width="${size}"`)
    .replace('height="512"', `height="${size}"`);
  return (
    <span
      style={{ display: "inline-flex", width: size, height: size, flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: sized }}
    />
  );
}

// Per-icon visual size so all icons appear similar in weight.
const NAV_ITEMS = [
  { id: "chat",     raw: chatSvgRaw,         label: "Chat",       size: 22 },
  { id: "graph",    raw: vectorDbSvgRaw,     label: "Vectorizer", size: 23 },
  { id: "commands", raw: commandLineSvgRaw,  label: "Commands",   size: 22 },
  { id: "settings", raw: settingsSvgRaw,     label: "Settings",   size: 21 },
];

function NavButton({ id, raw, label, size, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => onClick(id)}
        className={`
          relative flex items-center justify-center w-full h-14
          transition-opacity duration-150
          ${active ? "opacity-100" : "opacity-35 hover:opacity-70"}
        `}
      >
        {/* VS Code–style left accent bar on active item */}
        {active && (
          <span className="absolute left-0 top-4 bottom-4 w-[2px] bg-accent rounded-r" />
        )}
        <SvgIcon raw={raw} size={size} />
      </button>

      {/* Custom tooltip — appears to the right of the sidebar */}
      {hovered && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none">
          <span className="bg-vsc-elevated border border-vsc-border text-vsc-text text-xs font-body px-2.5 py-1 rounded shadow-xl whitespace-nowrap block">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="flex flex-col items-center w-16 bg-vsc-bg shrink-0 py-2 border-r border-vsc-border/40">
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.id}
          {...item}
          active={activeView === item.id}
          onClick={onNavigate}
        />
      ))}
    </aside>
  );
}
