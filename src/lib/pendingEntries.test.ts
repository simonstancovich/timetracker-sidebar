import { describe, it, expect } from "vitest";
import { isPendingId, makePendingEntry, entrySignature } from "./pendingEntries";
import type { SaveEntryPayload } from "../api";

const basePayload = (over: Partial<SaveEntryPayload> = {}): SaveEntryPayload =>
  ({
    id: "-1",
    company: "Acme",
    project: "Website",
    description: "Built a thing",
    internal_description: "note",
    hour: "1.5",
    invoice_hours: "1.5",
    invoice: "true",
    no_flex: "false",
    username: "simon",
    _user_id: "7",
    _company_id: "12",
    _project_id: "34",
    hour_price: "0",
    task_date: "2026-05-25",
    create_date: "2026-05-25T10:00:00",
    admin_ok: "false",
    _admin_id: "",
    admin_date: "",
    ignore_flex: "false",
    invoiced: "false",
    show_customer: "false",
    _invoicer_id: "",
    invoicer: "",
    verifier: "",
    delete: "false",
    companyadmin: "false",
    ...over,
  }) as SaveEntryPayload;

describe("isPendingId", () => {
  it("recognizes local pending ids", () => {
    expect(isPendingId("pending_123_abc")).toBe(true);
    expect(isPendingId("9981")).toBe(false);
  });
});

describe("makePendingEntry", () => {
  it("maps the payload to a display row with a pending id", () => {
    const item = makePendingEntry(basePayload());
    expect(isPendingId(item.localId)).toBe(true);
    expect(item.entry.id).toBe(item.localId);
    expect(item.entry._company_id).toBe("12");
    expect(item.entry._project_id).toBe("34");
    expect(item.entry.description).toBe("Built a thing");
    expect(item.entry.hour).toBe("1.5");
    expect(item.entry.invoice).toBe("1"); // 'true' → '1'
    expect(item.payload).toBe(item.payload);
    expect(item.queuedAt).toBeTypeOf("number");
  });

  it("maps internal (non-billable) invoice flag to 0", () => {
    const item = makePendingEntry(basePayload({ invoice: "false" }));
    expect(item.entry.invoice).toBe("0");
  });
});

describe("entrySignature", () => {
  it("matches a payload and the server row it becomes", () => {
    const payload = basePayload({ hour: "8", invoice: "true" });
    const serverRow = {
      task_date: "2026-05-25 00:00:00", // server format
      _project_id: "34",
      hour: "8.00",
      description: "Built a thing",
      invoice: "1",
    };
    expect(entrySignature(payload)).toBe(entrySignature(serverRow));
  });

  it("differs on date, project, hours, description or billable", () => {
    const base = basePayload({ hour: "8" });
    const sig = entrySignature(base);
    expect(entrySignature(basePayload({ hour: "4" }))).not.toBe(sig);
    expect(entrySignature(basePayload({ _project_id: "99" }))).not.toBe(sig);
    expect(entrySignature(basePayload({ task_date: "2026-05-26" }))).not.toBe(sig);
    expect(entrySignature(basePayload({ description: "Other" }))).not.toBe(sig);
    expect(entrySignature(basePayload({ invoice: "false" }))).not.toBe(sig);
  });
});
