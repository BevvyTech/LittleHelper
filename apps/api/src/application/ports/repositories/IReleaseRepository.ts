import { type Release, type ReleasePageSnapshot } from '../../../domain/releases/index.js';

export interface CreateReleaseData {
  tag: string;
  name: string;
  description?: string | null;
}

export interface ReleaseSnapshotData {
  pageLocaleId: string;
  slugAtRelease: string;
  titleAtRelease: string;
}

export interface IReleaseRepository {
  create(data: CreateReleaseData): Promise<Release>;
  findByTag(tag: string): Promise<Release | null>;
  findAll(): Promise<Release[]>;
  delete(tag: string): Promise<void>;
  createSnapshot(releaseId: string, snapshots: ReleaseSnapshotData[]): Promise<ReleasePageSnapshot[]>;
  getSnapshotByRelease(releaseId: string): Promise<ReleasePageSnapshot[]>;
}
