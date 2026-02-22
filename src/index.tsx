import React, { useEffect, useRef, useState } from "react";
import { useRozeniteDevToolsClient } from "@rozenite/plugin-bridge";
import type {
  RequestStoresSnapshotPayload,
  ZustandStoreSnapshot,
  ZustandStoresSnapshotPayload,
  ZustandTracePayload,
} from "../react-native";

interface PluginEvents extends Record<string, unknown> {
  "request-stores-snapshot": RequestStoresSnapshotPayload;
  "zustand-trace": ZustandTracePayload;
  "zustand-stores-snapshot": ZustandStoresSnapshotPayload;
}

export default function ZustandPanel() {
  const client = useRozeniteDevToolsClient<PluginEvents>({
    pluginId: "rozenite-zustand-plugin",
  });
  const [traces, setTraces] = useState<ZustandTracePayload[]>([]);
  const [registeredStores, setRegisteredStores] = useState<
    ZustandStoreSnapshot[]
  >([]);
  const [selected, setSelected] = useState<ZustandTracePayload | null>(null);
  const [selectedStore, setSelectedStore] =
    useState<ZustandStoreSnapshot | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  console.log("registeredStores", registeredStores);

  useEffect(() => {
    if (!client) return;

    const subTrace = client.onMessage("zustand-trace", (data) => {
      setTraces((prev) => [...prev.slice(-199), data]);
      setRegisteredStores((prev) => {
        const name = data.storeName;
        const next = { storeName: name, state: data.state };
        const idx = prev.findIndex((s) => s.storeName === name);
        if (idx >= 0) {
          const out = [...prev];
          out[idx] = next;
          return out;
        }
        return [...prev, next];
      });
    });

    const subSnapshot = client.onMessage("zustand-stores-snapshot", (data) => {
      setRegisteredStores(data.stores);
    });

    client.send("request-stores-snapshot", {});

    return () => {
      subTrace.remove();
      subSnapshot.remove();
    };
  }, [client]);

  if (!client) {
    return (
      <div style={{ padding: 16, color: "#666" }}>
        Connecting to React Native…
      </div>
    );
  }

  const actionLabel = (payload: ZustandTracePayload): string => {
    const a = payload.action;
    if (a === undefined) return "—";
    return typeof a === "string" ? a : a.type;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          fontWeight: 600,
          background: "#fafafa",
        }}
      >
        Zustand
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div
          ref={listRef}
          style={{
            flex: "0 0 220px",
            overflow: "auto",
            borderRight: "1px solid #eee",
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {registeredStores.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#666",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Registered stores
              </div>
              {registeredStores.map((s, i) => (
                <button
                  key={s.storeName ?? i}
                  type="button"
                  onClick={() => {
                    setSelectedStore(s);
                    setSelected(null);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    marginBottom: 4,
                    border: "1px solid #eee",
                    borderRadius: 4,
                    background: selectedStore === s ? "#e8f5e9" : "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    {s.storeName ?? "(anonymous)"}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#666",
                marginBottom: 6,
                textTransform: "uppercase",
              }}
            >
              Action history
            </div>
            {traces.length === 0 ? (
              <div style={{ color: "#999", fontSize: 12 }}>
                No state updates yet. Use a store with withRozenite().
              </div>
            ) : (
              traces.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelected(t);
                    setSelectedStore(null);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    marginBottom: 4,
                    border: "1px solid #eee",
                    borderRadius: 4,
                    background: selected === t ? "#e3f2fd" : "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>
                    {actionLabel(t)}
                    {t.storeName ? ` (${t.storeName})` : ""}
                  </span>
                  <br />
                  <span style={{ color: "#666", fontSize: 11 }}>
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          {selected ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <strong>Action:</strong>{" "}
                {typeof selected.action === "string"
                  ? selected.action
                  : JSON.stringify(selected.action)}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Prev state:</strong>
                <pre
                  style={{
                    margin: "4px 0 0",
                    padding: 8,
                    background: "#f5f5f5",
                    borderRadius: 4,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(selected.prev, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Next state:</strong>
                <pre
                  style={{
                    margin: "4px 0 0",
                    padding: 8,
                    background: "#f5f5f5",
                    borderRadius: 4,
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(selected.state, null, 2)}
                </pre>
              </div>
            </>
          ) : selectedStore ? (
            (() => {
              const current = registeredStores.find(
                (s) => s.storeName === selectedStore.storeName,
              );
              const state = current?.state ?? selectedStore.state;
              return (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Store:</strong>{" "}
                    {selectedStore.storeName ?? "(anonymous)"}
                  </div>
                  <div>
                    <strong>State:</strong>
                    <pre
                      style={{
                        margin: "4px 0 0",
                        padding: 8,
                        background: "#f5f5f5",
                        borderRadius: 4,
                        overflow: "auto",
                      }}
                    >
                      {JSON.stringify(state, null, 2)}
                    </pre>
                  </div>
                </>
              );
            })()
          ) : (
            <div style={{ color: "#999" }}>
              Select a store to see its state, or a trace to inspect prev/next
              state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
