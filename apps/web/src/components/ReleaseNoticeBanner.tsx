interface ReleaseNoticeBannerProps {
  tag: string;
  onBackToLatest?: () => void;
}

export function ReleaseNoticeBanner({ tag, onBackToLatest }: ReleaseNoticeBannerProps) {
  return (
    <div className="release-notice">
      <div>
        Viewing release <strong>{tag}</strong>. Content may differ from latest.
      </div>
      {onBackToLatest && (
        <button className="release-notice__action" onClick={onBackToLatest}>
          Back to latest
        </button>
      )}
    </div>
  );
}
