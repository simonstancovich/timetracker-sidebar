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

export function useLogForm() {
  const [fCo, setFCo] = useState("");
  const [fPr, setFPr] = useState("");
  const [fH, setFH] = useState(1);
  const [fD, setFD] = useState("");
  const [fNote, setFNote] = useState("");
  const [fInv, setFInv] = useState(true);
  const [fHInput, setFHInput] = useState("1:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState<Date>(() => new Date());

  useEffect(() => {
    setFHInput(fmtHours(fH));
  }, [fH]);

  const reset = useCallback(() => {
    setEditingId(null);
    setFormDate(new Date());
    setFCo("");
    setFPr("");
    setFH(1);
    setFD("");
    setFNote("");
    setFInv(true);
  }, []);

  const openForNew = useCallback((date: Date) => {
    setEditingId(null);
    setFormDate(date);
  }, []);

  const openForEdit = useCallback((id: string, date: Date) => {
    setEditingId(id);
    setFormDate(date);
  }, []);

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
    formDate, setFormDate,
    openForNew,
    openForEdit,
    reset,
    hydrate,
  };
}

export type UseLogForm = ReturnType<typeof useLogForm>;
