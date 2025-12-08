export interface ReleasePageSnapshotProps {
  id: string;
  releaseId: string;
  pageLocaleId: string;
  slugAtRelease: string;
  titleAtRelease: string;
}

export class ReleasePageSnapshot {
  readonly id: string;
  readonly releaseId: string;
  readonly pageLocaleId: string;
  readonly slugAtRelease: string;
  readonly titleAtRelease: string;

  constructor(props: ReleasePageSnapshotProps) {
    this.id = props.id;
    this.releaseId = props.releaseId;
    this.pageLocaleId = props.pageLocaleId;
    this.slugAtRelease = props.slugAtRelease;
    this.titleAtRelease = props.titleAtRelease;
  }
}
