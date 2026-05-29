import { useCallback, useEffect, useState } from "react";
import { fmtHours } from "./hours";

export interface StoredLogForm {
  fCo?: string;
  fPr?: string;
  fH?: number;
  fD?: string;
  fNote?: string;
  fInv?: boolean;
}

// Cohesive state for the manual time-entry ("log") form — the fields plus the
// derived hours-input text and the entry being edited. Shared by the LogView
// and by App's edit-entry / reset flows.
export function useLogForm() {
  const [fCo, setFCo] = useState("");
  const [fPr, setFPr] = useState("");
  const [fH, setFH] = useState(1);
  const [fD, setFD] = useState("");
  const [fNote, setFNote] = useState("");
  const [fInv, setFInv] = useState(true);
  const [fHInput, setFHInput] = useState("1:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<Date | null>(null);

  // Keep the hours text in sync with the numeric value.
  useEffect(() => {
    setFHInput(fmtHours(fH));
  }, [fH]);

  const reset = useCallback(() => {
    setEditingId(null);
    setEditingDate(null);
    setFCo("");
    setFPr("");
    setFH(1);
    setFD("");
    setFNote("");
    setFInv(true);
  }, []);

  // Populate the fields from a persisted draft (the hours text re-syncs via the
  // effect above).
  const hydrate = useCallback((f: StoredLogForm) => {
    setFCo(f.fCo || "");
    setFPr(f.fPr || "");
    setFH(typeof f.fH === "number" ? f.fH : 1);
    setFD(f.fD || "");
    setFNote(f.fNote || "");
    setFInv(typeof f.fInv === "boolean" ? f.fInv : true);
  }, []);

  return {
    fCo, setFCo,
    fPr, setFPr,
    fH, setFH,
    fD, setFD,
    fNote, setFNote,
    fInv, setFInv,
    fHInput, setFHInput,
    editingId, setEditingId,
    editingDate, setEditingDate,
    reset,
    hydrate,
  };
}

export type UseLogForm = ReturnType<typeof useLogForm>;
