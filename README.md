## Rozenite Zustand Plugin

Inspect Zustand stores and trace actions/state in React Native DevTools.

### Seeing the Zustand tab

1. **Build the plugin** (from this folder):
   ```bash
   yarn build
   ```

2. **Start the Rozenite dev server** (required so DevTools can load the panel):
   ```bash
   yarn dev
   ```
   Leave this running (default port 8888).

3. **Start the demo app** with the plugin enabled:
   ```bash
   cd demo
   yarn start
   # or yarn ios / yarn android / yarn web
   ```
   The demo `package.json` already sets `ROZENITE_DEV_MODE=rozenite-zustand-plugin`.  
   **Use your plugin’s package name here** (from `package.json`), not the placeholder `my-awesome-plugin` from Rozenite’s docs.

4. **Open React Native DevTools** (from the Expo / RN dev menu or browser). You should see a **Zustand** tab in the sidebar.

If the tab doesn’t appear, try:
- Refreshing DevTools (e.g. **Cmd+R** / **Ctrl+R** in the DevTools window).
- Confirming `yarn dev` is running in the plugin root before opening the app.
- Running `yarn install` in `demo/` so the plugin is linked (e.g. `"rozenite-zustand-plugin": "file:.."`).
