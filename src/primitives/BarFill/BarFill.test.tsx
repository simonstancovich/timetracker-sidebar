import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BarFill } from "./BarFill";
import * as s from "./BarFill.css";

describe("<BarFill />", () => {
  it("renders with the root class and partial tone by default", () => {
    const { container } = render(<BarFill fraction={0.5} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.root);
    expect(el.className).toContain(s.tone.partial);
  });

  it("sets height from the fraction prop", () => {
    const { container } = render(<BarFill fraction={0.44} />);
    expect((container.firstChild as HTMLElement).style.height).toBe("44%");
  });

  it.each([
    [-0.5, "0%"],
    [0, "0%"],
    [0.5, "50%"],
    [1, "100%"],
    [1.5, "100%"],
  ])("clamps fraction=%s to %s", (input, expected) => {
    const { container } = render(<BarFill fraction={input} />);
    expect((container.firstChild as HTMLElement).style.height).toBe(expected);
  });

  it.each(["met", "today", "partial"] as const)("applies the %s tone", (tone) => {
    const { container } = render(<BarFill fraction={1} tone={tone} />);
    expect((container.firstChild as HTMLElement).className).toContain(s.tone[tone]);
  });

  it("adds the active outline class only when active", () => {
    const { container, rerender } = render(<BarFill fraction={1} />);
    expect((container.firstChild as HTMLElement).className).not.toContain(s.active);
    rerender(<BarFill fraction={1} active />);
    expect((container.firstChild as HTMLElement).className).toContain(s.active);
  });

  it("is aria-hidden (decorative)", () => {
    const { container } = render(<BarFill fraction={0.5} />);
    expect((container.firstChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("merges a consumer-supplied className", () => {
    const { container } = render(<BarFill fraction={0.5} className="extra" />);
    expect((container.firstChild as HTMLElement).className).toContain("extra");
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<BarFill fraction={0.5} ref={ref} />);
    expect(ref.current).toBe(container.firstChild);
  });
});
