interface SyncLog {
  id: string;
  action: string;
  status: 'success' | 'error';
  startedAt: string;
  duration: string;
  details?: string;
}

interface SyncLogTableProps {
  logs: SyncLog[];
}

export function SyncLogTable({ logs }: SyncLogTableProps) {
  return (
    <div className="sync-log">
      <div className="sync-log__header">
        <span>Action</span>
        <span>Status</span>
        <span>Started</span>
        <span>Duration</span>
      </div>
      {logs.map((log) => (
        <details key={log.id} className="sync-log__row">
          <summary>
            <span>{log.action}</span>
            <span className={`badge badge--${log.status === 'success' ? 'success' : 'danger'}`}>
              {log.status === 'success' ? 'Success' : 'Error'}
            </span>
            <span>{log.startedAt}</span>
            <span>{log.duration}</span>
          </summary>
          {log.details && <div className="sync-log__details">{log.details}</div>}
        </details>
      ))}
      {logs.length === 0 && <div className="sync-log__empty">No sync history yet.</div>}
    </div>
  );
}
