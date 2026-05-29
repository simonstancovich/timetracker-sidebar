import { useEffect, useRef, useState } from "react";

export function usePersistedStore<TPayload, THydrate>({
  key,
  payload,
  hydrate,
}: {
  key: string;
  payload: TPayload;
  hydrate: (stored: THydrate) => void;
}): void {
  const hydrateRef = useRef(hydrate);
  hydrateRef.current = hydrate;
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await window.electronAPI.storeGet(key);
      if (stored && typeof stored === "object") {
        hydrateRef.current(stored as THydrate);
      }
      setLoaded(true);
    })();
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    window.electronAPI.storeSet(key, payload);
  }, [key, loaded, payload]);
}
