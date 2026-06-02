import { useTranslation } from "../lib/i18n";
import { useModal } from "../lib/useModal";
import * as prim from "../primitives";
import * as s from "./ConfirmationModal.css";

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
  const ref = useModal<HTMLElement>({
    enabled: !!request,
    onClose: onDismiss,
  });
  if (!request) return null;
  return (
    <>
      <prim.Overlay
        tone="none"
        zIndex="modalBackdrop"
        className={s.backdrop}
        onClick={onDismiss}
        aria-hidden
      />
      <prim.Stack
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        tabIndex={-1}
        gap="md"
        className={s.dialog}
      >
        <prim.Stack gap="xs">
          <prim.Text id="confirmation-title" size="lg" weight="bold" color="primary">
            {request.title}
          </prim.Text>
          <prim.Text size="base" color="tertiary">
            {request.body}
          </prim.Text>
        </prim.Stack>
        <prim.Stack direction="row" gap="sm">
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
      </prim.Stack>
    </>
  );
}
