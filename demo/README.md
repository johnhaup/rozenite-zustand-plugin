## Demo App

### Development

**Two terminals:**

1. **Plugin root** — start the Rozenite dev server (so DevTools can load the Zustand panel):
   ```bash
   # from parent folder (plugin root)
   yarn dev
   ```
   Keep this running. It rebuilds the panel when you edit `src/index.tsx`.

2. **This folder** — start the Expo app:
   ```bash
   yarn start
   # or yarn android / yarn ios / yarn web
   ```

Open React Native DevTools; the **Zustand** tab should appear. **After editing the panel** (`src/index.tsx`), refresh DevTools (**Cmd+R** / **Ctrl+R**) to see changes. No need to restart the app.

See the [main README](../README.md#development-workflow) for full details and troubleshooting.
