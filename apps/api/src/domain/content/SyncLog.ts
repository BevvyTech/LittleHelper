export type SyncStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

export interface SyncLogProps {
  id: string;
  status: SyncStatus;
  message: string | null;
  details: Record<string, unknown> | null;
  startedAt: Date;
  finishedAt: Date | null;
}

export class SyncLog {
  readonly id: string;
  readonly status: SyncStatus;
  readonly message: string | null;
  readonly details: Record<string, unknown> | null;
  readonly startedAt: Date;
  readonly finishedAt: Date | null;

  constructor(props: SyncLogProps) {
    this.id = props.id;
    this.status = props.status;
    this.message = props.message;
    this.details = props.details;
    this.startedAt = props.startedAt;
    this.finishedAt = props.finishedAt;
  }

  isRunning(): boolean {
    return this.status === 'RUNNING';
  }

  isFinished(): boolean {
    return this.status === 'SUCCESS' || this.status === 'FAILURE';
  }
}
