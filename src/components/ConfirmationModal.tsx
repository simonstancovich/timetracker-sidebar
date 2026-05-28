import { useTranslation } from "../lib/i18n";
import { useModal } from "../lib/useModal";
import { vars } from "../theme";
import * as prim from "../primitives";

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
        <prim.Stack gap="xs">
          <div id="confirmation-title">
            <prim.Text size="lg" weight="bold" color="primary">
              {request.title}
            </prim.Text>
          </div>
          <prim.Text size="base" color="tertiary">
            {request.body}
          </prim.Text>
        </prim.Stack>
        <prim.Stack direction="row" gap="sm" paddingTop="md">
          <prim.Button variant="secondary" size="sm" grow onClick={onDismiss}>
            {t("entry.cancel")}
          </prim.Button>
          <prim.Button
            variant="primary"
            size="sm"
            grow
            onClick={async () => {
              const fn = request.onConfirm;
              onDismiss();
              await fn();
            }}
          >
            {request.confirmLabel}
          </prim.Button>
        </prim.Stack>
      </div>
    </>
  );
}
