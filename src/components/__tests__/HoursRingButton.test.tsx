import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import i18n from "i18next";
import { HoursRingButton } from "../HoursRingButton";
import { fmtHours } from "../../lib/hours";

afterEach(async () => {
  await i18n.changeLanguage("en");
});

const base = {
  tRun: false,
  tSec: 0,
  todayH: 4,
  goalHours: 8,
  done: false,
  onClick: () => {},
};

describe("<HoursRingButton />", () => {
  it("labels itself as running when the timer is active", () => {
    render(<HoursRingButton {...base} tRun />);
    expect(screen.getByRole("button", { name: "Timer running" })).toBeInTheDocument();
  });

  it("labels itself as paused when stopped mid-session", () => {
    render(<HoursRingButton {...base} tSec={120} />);
    expect(
      screen.getByRole("button", { name: "Timer paused — resume on Timer tab" }),
    ).toBeInTheDocument();
  });

  it("labels itself as idle when no timer is running", () => {
    render(<HoursRingButton {...base} />);
    expect(
      screen.getByRole("button", { name: "No timer running — click to start" }),
    ).toBeInTheDocument();
  });

  it("renders the formatted hours", () => {
    render(<HoursRingButton {...base} todayH={4} />);
    expect(screen.getByText(fmtHours(4))).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<HoursRingButton {...base} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
