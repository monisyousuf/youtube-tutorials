import { Loader2, X } from "lucide-react";
import React, { useRef, useState } from "react";

function Toast({ message, type, onDismiss }) {
  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3
        px-4 py-3 rounded-lg shadow-xl
        font-body text-sm text-white
        w-[calc(100%-2rem)] max-w-xl
        ${type === "success"
          ? "bg-green-800 border border-green-600"
          : "bg-red-900 border border-red-700"
        }
      `}
    >
      <span className="flex-1 leading-relaxed">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ConfirmModal({ onCancel, onProceed }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-vsc-surface border border-vsc-border rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
        <p className="font-body text-sm text-vsc-text leading-relaxed mb-5">
          This will delete all vectors of all markdown files in the system
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-vsc-input border border-vsc-border text-vsc-muted hover:text-vsc-text rounded text-sm font-body transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded text-sm font-body transition-colors"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MetadataModal({ metadata, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-vsc-surface border border-vsc-border rounded-lg w-full max-w-3xl shadow-2xl flex flex-col max-h-[75vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vsc-border shrink-0">
          <h3 className="font-heading text-base font-semibold text-vsc-text">
            Vector Embedding Metadata
          </h3>
          <button onClick={onClose} className="text-vsc-muted hover:text-vsc-text transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {metadata.length === 0 ? (
            <p className="font-body text-sm text-vsc-muted text-center py-4">
              No embeddings found in the database.
            </p>
          ) : (
            metadata.map((item) => (
              <div key={item.source}>
                <p className="font-body text-xs font-semibold text-vsc-text mb-2 tracking-wide uppercase opacity-70">
                  {item.source}
                </p>
                <div className="flex flex-col gap-1.5">
                  {item.sections.map((sec) => (
                    <div
                      key={sec.section_id}
                      className="flex items-center gap-3 px-3 py-2 bg-vsc-input border border-vsc-border/60 rounded"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                      <span className="font-mono text-xs text-vsc-text flex-1 truncate">
                        {sec.section_id}
                      </span>
                      <span
                        className="font-mono text-[10px] text-vsc-muted bg-vsc-elevated border border-vsc-border/50 rounded px-1.5 py-0.5 shrink-0"
                        title={sec.section_hash}
                      >
                        {sec.section_hash.slice(0, 8)}
                      </span>
                      <span className="font-body text-[10px] text-vsc-muted/70 shrink-0 whitespace-nowrap hidden sm:block">
                        {formatTimestamp(sec.last_modified)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function GraphView() {
  const [docs, setDocs] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [selected, setSelected] = useState("");
  const [vectorizing, setVectorizing] = useState(false);
  const [vectorizingAll, setVectorizingAll] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [controlSelected, setControlSelected] = useState("");
  const [deletingFile, setDeletingFile] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const [metadata, setMetadata] = useState(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  function showToast(message, type) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 8000);
  }

  function dismissToast() {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }

  async function fetchDocs() {
    setToast(null);
    setFetching(true);
    try {
      const res = await fetch("/docs-api/docs");
      if (!res.ok) throw new Error("Failed to fetch documentation list");
      const data = await res.json();
      setDocs(data.files);
      if (data.files.length > 0) {
        setSelected(data.files[0]);
        setControlSelected(data.files[0]);
      }
      return data.files;
    } catch (err) {
      showToast(err.message, "error");
      return null;
    } finally {
      setFetching(false);
    }
  }

  async function vectorizeFile(filename) {
    const res = await fetch("/vectorizer-api/vectorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Vectorization failed");
    return data.chunks_processed;
  }

  async function handleVectorize() {
    if (!selected) return;
    setToast(null);
    setVectorizing(true);
    try {
      const chunksProcessed = await vectorizeFile(selected);
      if (chunksProcessed === 0) {
        showToast("Chunks already up-to-date — no changes detected.", "success");
      } else {
        showToast(`Vectorized successfully: ${selected} (${chunksProcessed} chunks updated)`, "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setVectorizing(false);
    }
  }

  async function handleVectorizeAll() {
    setToast(null);
    setVectorizingAll(true);
    try {
      const fileList = docs ?? await fetchDocs();
      if (!fileList || fileList.length === 0) {
        showToast("No documents found to vectorize.", "error");
        return;
      }

      let totalUpdated = 0;
      let failed = 0;
      for (const filename of fileList) {
        try {
          const chunks = await vectorizeFile(filename);
          totalUpdated += chunks;
        } catch {
          failed++;
        }
      }

      if (failed > 0) {
        showToast(`Completed with errors: ${failed} file(s) failed. ${totalUpdated} chunks updated.`, "error");
      } else if (totalUpdated === 0) {
        showToast("All documents are already up-to-date — no changes detected.", "success");
      } else {
        showToast(`All documents vectorized. ${totalUpdated} chunk(s) updated across ${fileList.length} file(s).`, "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setVectorizingAll(false);
    }
  }

  async function handleViewMetadata() {
    setToast(null);
    setFetchingMeta(true);
    try {
      const res = await fetch("/vectorizer-api/metadata");
      if (!res.ok) throw new Error("Failed to fetch metadata");
      const data = await res.json();
      setMetadata(data.metadata);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFetchingMeta(false);
    }
  }

  async function handleDeleteFile() {
    if (!controlSelected) return;
    setToast(null);
    setDeletingFile(true);
    try {
      const res = await fetch(`/vectorizer-api/delete/${encodeURIComponent(controlSelected)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || "Delete failed", "error");
      } else {
        showToast(`Deleted ${data.deleted} vector(s) for ${controlSelected}`, "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeletingFile(false);
    }
  }

  async function handleDeleteAll() {
    setShowDeleteAllModal(false);
    setToast(null);
    setDeletingAll(true);
    try {
      const res = await fetch("/vectorizer-api/delete-all", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || "Delete failed", "error");
      } else {
        showToast(`Deleted all vectors (${data.deleted} total)`, "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeletingAll(false);
    }
  }

  const hasDocs = docs !== null;
  const isBusy = vectorizing || vectorizingAll;

  return (
    <div className="flex items-start justify-center h-full p-8 overflow-y-auto bg-vsc-bg">
      <div className="w-full max-w-[860px] flex flex-col gap-6">

        {/* Documentation Vectorizer — full width */}
        <div className="bg-vsc-surface border border-vsc-border rounded-lg p-8">
          <h2 className="font-heading text-xl font-semibold text-vsc-text mb-1 tracking-wide">
            Documentation Vectorizer
          </h2>
          <p className="font-body text-xs text-vsc-muted mb-6 leading-relaxed">
            This feature allows you to create vector embeddings for each document. Fetch the documentation to get started.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={fetchDocs}
              disabled={fetching}
              className="w-full py-2 px-4 bg-vsc-btn text-white rounded text-sm font-body font-medium hover:bg-vsc-btnHover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {fetching && <Loader2 size={15} className="animate-spin" />}
              Fetch Documentation
            </button>

            <div className="flex gap-3">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={!hasDocs || isBusy}
                className="flex-1 bg-vsc-input border border-vsc-border text-vsc-text font-body rounded px-3 py-2 text-sm outline-none focus:border-claude transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {!hasDocs && <option>— fetch documents first —</option>}
                {hasDocs && docs.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <button
                onClick={handleVectorize}
                disabled={!hasDocs || isBusy}
                className="py-2 px-4 bg-claude text-white rounded text-sm font-body font-medium hover:bg-[#c86030] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                {vectorizing && <Loader2 size={14} className="animate-spin" />}
                Vectorize
              </button>
            </div>

            <button
              onClick={handleVectorizeAll}
              disabled={isBusy || fetching}
              className="w-full py-2 px-4 bg-green-800 hover:bg-green-700 text-white border border-green-700 rounded text-sm font-body font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {vectorizingAll && <Loader2 size={15} className="animate-spin" />}
              Vectorize All
            </button>
            <p className="font-body text-[11px] text-vsc-muted/50 text-center leading-relaxed -mt-1">
              Vectorizing all documents may take time depending on the volume of content and pending changes.
            </p>

            {hasDocs && docs.length === 0 && (
              <p className="font-body text-sm text-vsc-muted text-center">
                No markdown files found.
              </p>
            )}
          </div>
        </div>

        {/* Metadata + Controls — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Vector Embedding Metadata */}
          <div className="bg-vsc-surface border border-vsc-border rounded-lg p-6 flex flex-col">
            <h2 className="font-heading text-xl font-semibold text-vsc-text mb-1 tracking-wide">
              Vector Embedding Metadata
            </h2>
            <p className="font-body text-xs text-vsc-muted mb-6 leading-relaxed">
              View which documents and their sections have embeddings present in the database.
            </p>
            <div className="mt-auto">
              <button
                onClick={handleViewMetadata}
                disabled={fetchingMeta}
                className="w-full py-2 px-4 bg-vsc-btn text-white rounded text-sm font-body font-medium hover:bg-vsc-btnHover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {fetchingMeta && <Loader2 size={15} className="animate-spin" />}
                View Metadata
              </button>
            </div>
          </div>

          {/* Vectorizer Controls */}
          <div className="bg-vsc-surface border border-vsc-border rounded-lg p-6 flex flex-col">
            <h2 className="font-heading text-xl font-semibold text-vsc-text mb-1 tracking-wide">
              Vectorizer Controls
            </h2>
            <p className="font-body text-xs text-vsc-muted mb-6 leading-relaxed">
              Delete the embeddings for a particular document or wipe out everything to start from scratch.
            </p>

            <div className="mt-auto flex flex-col gap-3">
              <div className="flex gap-2">
                <select
                  value={controlSelected}
                  onChange={(e) => setControlSelected(e.target.value)}
                  disabled={!hasDocs}
                  className="flex-1 bg-vsc-input border border-vsc-border text-vsc-text font-body rounded px-3 py-2 text-sm outline-none focus:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer min-w-0"
                >
                  {!hasDocs && <option>— fetch first —</option>}
                  {hasDocs && docs.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <button
                  onClick={handleDeleteFile}
                  disabled={!hasDocs || deletingFile}
                  className="py-2 px-3 bg-vsc-input border border-vsc-border text-vsc-muted hover:text-vsc-text hover:border-red-700/60 rounded text-sm font-body font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                >
                  {deletingFile && <Loader2 size={13} className="animate-spin" />}
                  Delete
                </button>
              </div>

              <button
                onClick={() => setShowDeleteAllModal(true)}
                disabled={deletingAll}
                className="w-full py-2 px-4 bg-red-900/40 border border-red-700/50 text-red-400 hover:bg-red-900/60 rounded text-sm font-body font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingAll && <Loader2 size={15} className="animate-spin" />}
                Delete Everything
              </button>

              {!hasDocs && (
                <p className="font-body text-xs text-vsc-muted/60 text-center">
                  Fetch documentation first to enable controls.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {showDeleteAllModal && (
        <ConfirmModal
          onCancel={() => setShowDeleteAllModal(false)}
          onProceed={handleDeleteAll}
        />
      )}

      {metadata !== null && (
        <MetadataModal
          metadata={metadata}
          onClose={() => setMetadata(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
    </div>
  );
}
