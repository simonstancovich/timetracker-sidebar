import type { Dispatch, SetStateAction } from "react";

export interface Item {
  id: string;
  name: string;
}

export interface StashedTimer {
  co: string;
  pr: string;
  desc: string;
  note: string;
  inv: boolean;
  sec: number;
  draftId: string | null;
  coName: string;
}

export interface TimerState {
  tCo: string;
  tPr: string;
  tD: string;
  tNote: string;
  tInv: boolean;
  tSec: number;
  tRun: boolean;
  draftId: string | null;
  setTCo: Dispatch<SetStateAction<string>>;
  setTPr: Dispatch<SetStateAction<string>>;
  setTD: Dispatch<SetStateAction<string>>;
  setTNote: Dispatch<SetStateAction<string>>;
  setTInv: Dispatch<SetStateAction<boolean>>;
  setTRun: Dispatch<SetStateAction<boolean>>;
}

export interface TodosForTimer {
  activeTodoId: string | null;
  setActiveTodoId: Dispatch<SetStateAction<string | null>>;
  accrueTodoHours: (todoId: string | null, totalHours: number) => void;
}

export interface CompaniesForTimer {
  list: Item[];
  cache: Record<string, Item[]>;
  error: boolean;
  projectErrors: Record<string, boolean>;
  ensure: (cid: string) => unknown;
  reload: () => void;
}
