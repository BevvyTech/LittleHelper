export interface ReleasePageSnapshotProps {
  id: string;
  releaseId: string;
  pageLocaleId: string;
  slugAtRelease: string;
}

export class ReleasePageSnapshot {
  readonly id: string;
  readonly releaseId: string;
  readonly pageLocaleId: string;
  readonly slugAtRelease: string;

  constructor(props: ReleasePageSnapshotProps) {
    this.id = props.id;
    this.releaseId = props.releaseId;
    this.pageLocaleId = props.pageLocaleId;
    this.slugAtRelease = props.slugAtRelease;
  }
}
