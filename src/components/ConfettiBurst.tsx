import { vars } from "../theme";

interface Props {
  show: boolean;
}

export function ConfettiBurst({ show }: Props) {
  if (!show) return null;
  return (
    <div
      className="confetti-burst"
      aria-hidden
      style={{ left: "50%", top: "30%" }}
    >
      {Array.from({ length: 22 }).map((_, i) => {
        const angle = (i / 22) * Math.PI * 2;
        const dist = 90 + Math.random() * 90;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 30;
        const rot = (Math.random() - 0.5) * 720;
        const palette = [
          vars.typography.accent,
          vars.typography.pink,
          vars.typography.green,
          "#e8c060",
        ];
        const color = palette[i % palette.length];
        const delay = Math.random() * 120;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                background: color,
                "--cx": `${dx}px`,
                "--cy": `${dy}px`,
                "--cr": `${rot}deg`,
                animationDelay: `${delay}ms`,
              } as { [k: string]: string }
            }
          />
        );
      })}
    </div>
  );
}
