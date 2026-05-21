import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Overlay } from "./Overlay";
import * as s from "./Overlay.css";

describe("<Overlay />", () => {
  it("renders children and forwards passthrough attributes", () => {
    render(
      <Overlay role="dialog" aria-modal="true" aria-label="Tour">
        hello
      </Overlay>,
    );
    const el = screen.getByRole("dialog", { name: "Tour" });
    expect(el).toHaveAttribute("aria-modal", "true");
    expect(el).toHaveTextContent("hello");
  });

  it("applies defaults: zIndex=modal, tone=none", () => {
    const { container } = render(<Overlay>x</Overlay>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.zIndex.modal);
    expect(el.className).toContain(s.tone.none);
  });

  it("respects zIndex and tone props", () => {
    const { container } = render(
      <Overlay zIndex="introHighlight" tone="screen">
        x
      </Overlay>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.zIndex.introHighlight);
    expect(el.className).toContain(s.tone.screen);
  });

  it("renders a childless scrim backdrop", () => {
    const { container } = render(<Overlay tone="scrim" zIndex="introMask" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.tone.scrim);
    expect(el.className).toContain(s.zIndex.introMask);
  });

  it("merges a consumer className and forwards a ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Overlay ref={ref} className="extra">
        x
      </Overlay>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("extra");
    expect(ref.current).toBe(el);
  });
});
