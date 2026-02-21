import type { RozeniteDevToolsClient } from "@rozenite/plugin-bridge";
import type { StateCreator, StoreApi } from "zustand/vanilla";

// --- Plugin event types for Zustand tracing ---

export type ZustandAction = string | { type: string; [key: string]: unknown };

export interface ZustandTracePayload {
  storeName?: string;
  action?: ZustandAction;
  prev: unknown;
  state: unknown;
  timestamp: number;
}

interface PluginEvents extends Record<string, unknown> {
  "zustand-trace": ZustandTracePayload;
}

// Client is set when the plugin connects; middleware uses it to send traces.
let pluginClient: RozeniteDevToolsClient<PluginEvents> | null = null;

function sendTrace(payload: ZustandTracePayload): void {
  if (pluginClient) {
    pluginClient.send("zustand-trace", payload);
  }
}

// Infer action name from stack when not provided (same idea as zustand/devtools).
function findCallerName(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  const lines = stack.split("\n");
  const setStateLine = lines.findIndex((line) =>
    line.includes("setState") || line.includes("wrappedSet")
  );
  if (setStateLine < 0) return undefined;
  const callerLine = lines[setStateLine + 1]?.trim() ?? "";
  const match = /.+\s+(\S+)\s+.+/.exec(callerLine);
  return match?.[1];
}

export interface RozeniteMiddlewareOptions {
  name?: string;
  anonymousActionType?: string;
}

type SetState<T> = StoreApi<T>["setState"];

/**
 * Zustand middleware that traces every state update and optional action to Rozenite DevTools.
 * Use as: create(withRozenite({ name: 'myStore' })((set, get, api) => ({ ... })))
 *
 * To trace action names, pass a third argument when calling set:
 *   set({ bears: 1 }, false, 'increasePopulation')
 *   set({ bears: 0 }, false, { type: 'removeAllBears' })
 * If omitted, the middleware tries to infer the name from the call stack.
 */
export function withRozenite<T extends object>(
  options: RozeniteMiddlewareOptions = {}
) {
  const { name: storeName, anonymousActionType = "anonymous" } = options;

  const middleware =
    (f: StateCreator<T>): StateCreator<T> =>
    (set, get, store) => {
      function emitTrace(prev: unknown, next: unknown, actionArg?: ZustandAction): void {
        const rawAction = actionArg;
        const actionType =
          rawAction === undefined
            ? findCallerName(new Error().stack) ?? anonymousActionType
            : typeof rawAction === "string"
              ? rawAction
              : rawAction.type;

        const actionPayload: ZustandTracePayload["action"] =
          rawAction === undefined || typeof rawAction === "string"
            ? actionType
            : { ...rawAction, type: actionType };

        sendTrace({
          storeName,
          action: actionPayload,
          prev,
          state: next,
          timestamp: Date.now(),
        });
      }

      const wrappedSet: SetState<T> = (partial, replace) => {
        const prev = get();
        (set as (p: T | Partial<T> | ((s: T) => T | Partial<T>), r?: boolean) => void)(partial, replace);
        const next = get();
        const actionArg = (arguments as unknown as [unknown, boolean?, ZustandAction?])[2];
        emitTrace(prev, next, actionArg);
      };

      const initial = f(wrappedSet, get, store);

      // Expose 3-arg setState on the store so callers can pass action names
      const originalSetState = store.setState;
      store.setState = ((partial: T | Partial<T> | ((s: T) => T | Partial<T>), replace?: boolean, actionArg?: ZustandAction) => {
        const prev = get();
        (originalSetState as (p: T | Partial<T> | ((s: T) => T | Partial<T>), r?: boolean) => void)(partial, replace);
        const next = get();
        emitTrace(prev, next, actionArg);
      }) as SetState<T>;

      sendTrace({
        storeName,
        action: "@init",
        prev: undefined,
        state: initial,
        timestamp: Date.now(),
      });

      return initial;
    };

  return middleware;
}

/**
 * Plugin entry: register with Rozenite so the app's DevTools client can connect.
 * Call this from your Rozenite plugin entry (e.g. react-native.ts). The client
 * is stored and used by stores created with withRozenite().
 */
export default function setupPlugin(
  client: RozeniteDevToolsClient<PluginEvents>
): void {
  pluginClient = client;
}
