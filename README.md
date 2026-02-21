## Rozenite Zustand Plugin

Inspect Zustand stores and trace actions/state in React Native DevTools.

### Development workflow

Use **two terminals**:

**Terminal 1 — Rozenite dev server** (plugin root):

```bash
yarn dev
```

Leave this running. It builds and serves the Zustand panel (`src/index.tsx`) so DevTools can load it. When you edit the panel, the dev server rebuilds automatically.

**Terminal 2 — Demo app** (from `demo/`):

```bash
cd demo
yarn start
# or yarn ios / yarn android / yarn web
```

The demo already sets `ROZENITE_DEV_MODE=rozenite-zustand-plugin`. Open React Native DevTools (Expo/RN dev menu or browser); you should see a **Zustand** tab.

**After changing the panel** (`src/index.tsx`): refresh DevTools (**Cmd+R** / **Ctrl+R** in the DevTools window) to load the new bundle. You don’t need to restart the Expo app.

### First-time / production

- **Build the plugin** (e.g. before publishing or if not using `yarn dev`):
  ```bash
  yarn build
  ```
- **Link the plugin in the demo**: run `yarn install` in `demo/` so the `"rozenite-zustand-plugin": "file:.."` dependency is linked.

### Troubleshooting

If the Zustand tab doesn’t appear:

- Refresh DevTools (**Cmd+R** / **Ctrl+R**).
- Ensure `yarn dev` is running in the plugin root before opening DevTools.
- Ensure you ran `yarn install` in `demo/` so the plugin is linked.
