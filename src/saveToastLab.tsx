import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { SaveToast } from "./components/SaveToast";
import { AppLayout } from "./components/AppLayout";
import * as prim from "./primitives";
import { lightTheme } from "./theme";

function App() {
  const [shown, setShown] = useState(true);

  return (
    <AppLayout
      themeClass={lightTheme}
      mode="light"
      header={
        <prim.Stack padding="md" background="page">
          <prim.Text size="md">Header band</prim.Text>
        </prim.Stack>
      }
      footer={
        <prim.Stack padding="md" background="page">
          <prim.Text size="md">Footer band</prim.Text>
        </prim.Stack>
      }
      overlays={
        shown ? <SaveToast toast={{ cheer: "Logged!", hours: "1h", xp: 10 }} /> : null
      }
    >
      <prim.Stack padding="md" gap="md">
        <prim.Text size="md">Main content area.</prim.Text>
        <prim.Button variant="primary" onClick={() => setShown((v) => !v)}>
          Toggle toast
        </prim.Button>
        <prim.Text size="sm" color="tertiary">
          The toast should appear DEAD CENTER of the viewport, scrim dimming the whole app.
        </prim.Text>
      </prim.Stack>
    </AppLayout>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
