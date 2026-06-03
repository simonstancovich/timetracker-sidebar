import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Spotlight } from "../Spotlight";
import { mask, block } from "../Spotlight.css";

const hole = { top: 100, left: 50, right: 250, bottom: 200, width: 200, height: 100 };

describe("<Spotlight />", () => {
  it("renders four dimming masks and a highlight ring", () => {
    const { container } = render(
      <Spotlight hole={hole} onDismiss={() => {}} />,
    );
    expect(container.querySelectorAll(`.${mask}`)).toHaveLength(4);
    expect(container.querySelector(`.${block}`)).toBeNull();
  });

  it("adds the interaction blocker only when readOnly", () => {
    const { container } = render(
      <Spotlight hole={hole} readOnly onDismiss={() => {}} />,
    );
    expect(container.querySelector(`.${block}`)).toBeInTheDocument();
  });

  it("calls onDismiss when a mask is clicked", async () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <Spotlight hole={hole} onDismiss={onDismiss} />,
    );
    await userEvent.click(container.querySelector(`.${mask}`) as Element);
    expect(onDismiss).toHaveBeenCalled();
  });
});
