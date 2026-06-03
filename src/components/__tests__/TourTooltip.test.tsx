import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { TourTooltip } from "../TourTooltip";
import { fadeUp } from "../../styles/intro.css";

describe("<TourTooltip />", () => {
  it("renders children and forwards dialog passthrough attributes", () => {
    render(
      <TourTooltip top={10} left={20} maxWidth={264} role="dialog" aria-label="Step">
        body
      </TourTooltip>,
    );
    const el = screen.getByRole("dialog", { name: "Step" });
    expect(el).toHaveTextContent("body");
  });

  it("forwards a ref and merges a consumer className", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <TourTooltip ref={ref} top={0} left={0} maxWidth={200} className="extra">
        x
      </TourTooltip>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("extra");
    expect(el.className).toContain(fadeUp);
    expect(ref.current).toBe(el);
  });
});
