import { useTranslation } from "../lib/i18n";
import { useModal } from "../lib/useModal";
import { vars } from "../theme";

export interface ConfirmationRequest {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
}

interface Props {
  request: ConfirmationRequest | null;
  onDismiss: () => void;
}

export function ConfirmationModal({ request, onDismiss }: Props) {
  const { t } = useTranslation();
  const ref = useModal<HTMLDivElement>({
    enabled: !!request,
    onClose: onDismiss,
  });
  if (!request) return null;
  return (
    <>
      <div
        onClick={onDismiss}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 200,
        }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        tabIndex={-1}
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          background: vars.background.surface,
          border: `1.5px solid ${vars.typography.accent}`,
          borderRadius: 14,
          padding: "14px 16px",
          zIndex: 201,
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        }}
      >
        <div
          id="confirmation-title"
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: vars.typography.primary,
            marginBottom: 6,
          }}
        >
          {request.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: vars.typography.tertiary,
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          {request.body}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onDismiss}
            style={{
              flex: 1,
              padding: "9px 0",
              background: vars.background.raised,
              border: `1px solid ${vars.border.soft}`,
              borderRadius: 9,
              color: vars.typography.secondary,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("entry.cancel")}
          </button>
          <button
            onClick={async () => {
              const fn = request.onConfirm;
              onDismiss();
              await fn();
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              background: vars.background.button,
              border: "none",
              borderRadius: 9,
              color: vars.typography.onAccent,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {request.confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
