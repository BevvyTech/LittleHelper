interface ReleaseBadgeProps {
  tag: string;
}

export function ReleaseBadge({ tag }: ReleaseBadgeProps) {
  return <span className="release-badge">Release {tag}</span>;
}
