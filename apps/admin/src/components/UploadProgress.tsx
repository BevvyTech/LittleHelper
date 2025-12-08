interface UploadProgressProps {
  progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="upload-progress" aria-label="Upload progress">
      <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
      <span className="upload-progress__label">{progress}%</span>
    </div>
  );
}
