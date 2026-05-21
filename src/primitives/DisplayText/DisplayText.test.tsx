import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayText } from "./DisplayText";
import * as s from "./DisplayText.css";

describe("<DisplayText />", () => {
  it("renders as a span with children", () => {
    render(<DisplayText>Tuesday, May 20</DisplayText>);
    expect(screen.getByText("Tuesday, May 20").tagName).toBe("SPAN");
  });

  it("applies defaults: size=2xl, weight=normal, color=primary, tracking=normal", () => {
    const { container } = render(<DisplayText>x</DisplayText>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.size["2xl"]);
    expect(el.className).toContain(s.weight.normal);
    expect(el.className).toContain(s.color.primary);
    expect(el.className).toContain(s.tracking.normal);
  });

  it("respects overridable props", () => {
    const { container } = render(
      <DisplayText size="display" weight="bold" color="accent" align="center" italic truncate>
        x
      </DisplayText>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.size.display);
    expect(el.className).toContain(s.weight.bold);
    expect(el.className).toContain(s.color.accent);
    expect(el.className).toContain(s.align.center);
    expect(el.className).toContain(s.italic);
    expect(el.className).toContain(s.truncate);
  });

  it("merges a consumer-supplied className", () => {
    const { container } = render(<DisplayText className="extra">x</DisplayText>);
    expect((container.firstChild as HTMLElement).className).toContain("extra");
  });
});
