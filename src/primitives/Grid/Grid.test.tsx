import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Grid } from "./Grid";
import * as s from "./Grid.css";

describe("<Grid />", () => {
  it("applies the column-count and gap variant classes", () => {
    const { container } = render(
      <Grid columns={7} gap="xs">
        <span>x</span>
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.root);
    expect(el.className).toContain(s.columns[7]);
    expect(el.className).toContain(s.gap.xs);
  });

  it("defaults gap to none and merges a consumer className", () => {
    const { container } = render(
      <Grid columns={3} className="extra">
        x
      </Grid>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(s.columns[3]);
    expect(el.className).toContain(s.gap.none);
    expect(el.className).toContain("extra");
  });
});
