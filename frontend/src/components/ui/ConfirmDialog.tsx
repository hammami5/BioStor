'use client';

import { ReactNode } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

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
  confirmLabel = 'Confirm',
  loading,
  destructive,
  icon,
}: ConfirmDialogProps) {
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
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'gold'}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {icon && <div className="flex justify-center mb-2">{icon}</div>}
    </Dialog>
  );
}
