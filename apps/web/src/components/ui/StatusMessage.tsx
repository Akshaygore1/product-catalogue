import type { ReactNode } from 'react';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface StatusMessageProps {
  icon: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
}

/** Centred message used for empty, error and not-found states. */
export function StatusMessage({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
}: StatusMessageProps) {
  return (
    <div
      className="flex flex-col items-center px-4 py-16 text-center"
      role={tone === 'danger' ? 'alert' : undefined}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-selected">
        <Icon name={icon} size={24} className={tone === 'danger' ? 'text-danger' : 'text-strong'} />
      </div>
      <h2 className="text-lg font-medium text-strong">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-base text-subtle">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <StatusMessage
      icon="alert-circle"
      tone="danger"
      title="Something went wrong"
      description={error.message}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <Icon name="retry" />
            Try again
          </Button>
        )
      }
    />
  );
}
