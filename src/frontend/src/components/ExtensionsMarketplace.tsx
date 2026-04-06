import { CheckCircle2, Download, Puzzle, Search, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useExtensionsStore } from "../stores/extensionsStore";
import { useNotificationStore } from "../stores/notificationStore";

export const ExtensionsMarketplace: React.FC = () => {
  const { extensions, installExtension, uninstallExtension } =
    useExtensionsStore();
  const { addNotification } = useNotificationStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "installed">("all");

  const filtered = extensions.filter((ext) => {
    const matchSearch =
      !search ||
      ext.name.toLowerCase().includes(search.toLowerCase()) ||
      ext.description.toLowerCase().includes(search.toLowerCase()) ||
      ext.author.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "installed" && ext.isInstalled);
    return matchSearch && matchFilter;
  });

  const handleToggle = (ext: (typeof extensions)[0]) => {
    if (ext.isInstalled) {
      uninstallExtension(ext.id);
      addNotification({ message: `${ext.name} uninstalled`, type: "info" });
    } else {
      installExtension(ext.id);
      addNotification({
        message: `${ext.name} installed successfully`,
        type: "success",
      });
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          Extensions
        </span>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[var(--border)] flex-shrink-0">
        <div
          className="flex items-center gap-2 rounded border border-[var(--border)] px-2 py-1"
          style={{ background: "var(--bg-input)" }}
        >
          <Search size={11} style={{ color: "var(--text-muted)" }} />
          <input
            className="flex-1 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
            placeholder="Search extensions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="extensions.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={10} />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-2">
          {(["all", "installed"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-2 py-0.5 text-[10px] rounded capitalize transition-colors"
              style={{
                background:
                  filter === tab ? "var(--accent)" : "var(--bg-tab-inactive)",
                color: filter === tab ? "white" : "var(--text-secondary)",
              }}
              data-ocid={`extensions.${tab}.tab`}
            >
              {tab}{" "}
              {tab === "installed" &&
                `(${extensions.filter((e) => e.isInstalled).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center" data-ocid="extensions.empty_state">
            <Puzzle
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No extensions found
            </p>
          </div>
        ) : (
          filtered.map((ext, i) => (
            <div
              key={ext.id}
              className="flex items-start gap-3 px-3 py-3 border-b border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors"
              data-ocid={`extensions.item.${i + 1}`}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{
                  background: "var(--bg-tab-inactive)",
                  color: "var(--accent)",
                  border: "1px solid var(--border)",
                }}
              >
                {ext.name.charAt(0)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {ext.name}
                  </span>
                  {ext.isInstalled && (
                    <CheckCircle2
                      size={10}
                      style={{ color: "var(--accent)", flexShrink: 0 }}
                    />
                  )}
                </div>
                <p
                  className="text-[10px] mt-0.5 line-clamp-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {ext.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ext.author}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ·
                  </span>
                  <Download size={8} style={{ color: "var(--text-muted)" }} />
                  <span
                    className="text-[9px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ext.installs}
                  </span>
                  <span
                    className="text-[9px] px-1 rounded"
                    style={{
                      background: "var(--bg-activity)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {ext.category}
                  </span>
                </div>
              </div>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => handleToggle(ext)}
                className="flex-shrink-0 px-2 py-1 text-[10px] rounded border transition-colors"
                style={{
                  borderColor: ext.isInstalled
                    ? "var(--error)"
                    : "var(--accent)",
                  color: ext.isInstalled ? "var(--error)" : "var(--accent)",
                  background: "transparent",
                }}
                data-ocid={`extensions.toggle.${i + 1}`}
              >
                {ext.isInstalled ? "Uninstall" : "Install"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
