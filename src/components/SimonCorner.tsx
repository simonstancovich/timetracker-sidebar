import { vars } from "../theme";

interface Props {
  active: boolean;
  onTap: () => void;
}

export function SimonCorner({ active, onTap }: Props) {
  return (
    <div
      onClick={onTap}
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 22,
        height: 22,
        zIndex: 9999,
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: vars.typography.green,
            opacity: 0.7,
          }}
        />
      )}
    </div>
  );
}
