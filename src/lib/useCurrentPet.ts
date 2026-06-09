import { useCallback, useEffect, useState } from "react";
import { PET_CREATURES } from "../sprites/petSprites";

const STORAGE_KEY = "tt.petId";

function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function pickInitialId(): string {
  const stored = readStoredId();
  if (stored && PET_CREATURES.some((c) => c.id === stored)) return stored;
  return PET_CREATURES[0]?.id ?? "chick";
}

export function useCurrentPet() {
  const [petId, setPetId] = useState<string>(pickInitialId);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, petId);
    } catch {
      // ignore storage failures (e.g. private mode)
    }
  }, [petId]);

  const cyclePet = useCallback(() => {
    setPetId((current) => {
      const idx = PET_CREATURES.findIndex((c) => c.id === current);
      const next = PET_CREATURES[(idx + 1) % PET_CREATURES.length];
      return next?.id ?? current;
    });
  }, []);

  return { petId, cyclePet };
}
