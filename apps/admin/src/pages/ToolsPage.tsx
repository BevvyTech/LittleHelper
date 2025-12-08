import { useState } from 'react';
import { Button } from '@littlehelper/ui';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { SyncStatusBadge } from '../components/SyncStatusBadge.js';
import { SyncLogTable } from '../components/SyncLogTable.js';

type ToolAction = 'sync' | 'anchors' | 'seo' | 'cache';

export function ToolsPage() {
  const [activeAction, setActiveAction] = useState<ToolAction | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const [logs, setLogs] = useState([
    {
      id: '1',
      action: 'Sync from GitHub',
      status: 'success' as const,
      startedAt: 'Today, 9:20 AM',
      duration: '34s',
      details: 'Pulled 12 files, updated anchors, refreshed SEO metadata.',
    },
  ]);

  const triggerAction = (action: ToolAction) => {
    setStatus('running');
    setToast(null);
    setActiveAction(null);

    setTimeout(() => {
      setStatus('idle');
      setToast(`${labelFor(action)} completed successfully.`);
      setLogs((prev) => [
        {
          id: `${Date.now()}`,
          action: labelFor(action),
          status: 'success',
          startedAt: 'Just now',
          duration: '12s',
          details: `${labelFor(action)} finished without errors.`,
        },
        ...prev,
      ]);
    }, 900);
  };

  return (
    <div className="tools-page">
      <h1 className="page-title">Admin Tools</h1>
      <p className="page-description">Administrative actions and maintenance tools.</p>

      <div className="tools-page__grid">
        <ToolCard
          title="Sync from GitHub"
          description="Pull latest content from repository."
          actionLabel="Trigger Sync"
          onAction={() => setActiveAction('sync')}
          statusBadge={<SyncStatusBadge state={status} />}
        />
        <ToolCard
          title="Regenerate Anchors"
          description="Recompute anchors for all paragraphs."
          actionLabel="Regenerate"
          onAction={() => setActiveAction('anchors')}
          statusBadge={<SyncStatusBadge state={status} />}
        />
        <ToolCard
          title="Bulk SEO Generation"
          description="Generate AI metadata for all pages."
          actionLabel="Generate All"
          onAction={() => setActiveAction('seo')}
          statusBadge={<SyncStatusBadge state={status} />}
        />
        <ToolCard
          title="Clear Cache"
          description="Clear SSR and content cache."
          actionLabel="Clear"
          onAction={() => setActiveAction('cache')}
          statusBadge={<SyncStatusBadge state={status} />}
        />
      </div>

      <section className="card">
        <div className="section-header">
          <div>
            <h3>Sync History</h3>
            <p className="muted">Latest maintenance operations and results.</p>
          </div>
        </div>
        <SyncLogTable logs={logs} />
      </section>

      {toast && <div className="toast toast--success">{toast}</div>}

      <ConfirmModal
        open={Boolean(activeAction)}
        onCancel={() => setActiveAction(null)}
        onConfirm={() => activeAction && triggerAction(activeAction)}
        title="Run maintenance action?"
        description={`This will ${labelFor(activeAction ?? 'sync').toLowerCase()}. Proceed?`}
        confirmLabel="Run"
      />
    </div>
  );
}

interface ToolCardProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  statusBadge: React.ReactNode;
}

function ToolCard({ title, description, actionLabel, onAction, statusBadge }: ToolCardProps) {
  return (
    <div className="tools-card">
      <div className="tools-card__header">
        <div>
          <h3 className="tools-card__title">{title}</h3>
          <p className="tools-card__description">{description}</p>
        </div>
        {statusBadge}
      </div>
      <Button variant="secondary" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

function labelFor(action: ToolAction) {
  switch (action) {
    case 'anchors':
      return 'Anchor regeneration';
    case 'seo':
      return 'Bulk SEO generation';
    case 'cache':
      return 'Cache clear';
    default:
      return 'Sync from GitHub';
  }
}
