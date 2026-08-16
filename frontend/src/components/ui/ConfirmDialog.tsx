'use client';

import { ReactNode } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { useTranslation } from '@/lib/i18n';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  loading,
  destructive,
  icon,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {t.confirm_cancel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'gold'}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmLabel || t.confirm_confirm}
          </Button>
        </>
      }
    >
      {icon && <div className="flex justify-center mb-2">{icon}</div>}
    </Dialog>
  );
}
