type SyncState = 'idle' | 'running' | 'error';

interface SyncStatusBadgeProps {
  state: SyncState;
}

export function SyncStatusBadge({ state }: SyncStatusBadgeProps) {
  const label =
    state === 'running' ? 'Running' : state === 'error' ? 'Error' : 'Idle';

  return <span className={`badge badge--${state}`}>{label}</span>;
}
