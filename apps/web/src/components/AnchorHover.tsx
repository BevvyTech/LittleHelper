import { type ReactNode } from 'react';

interface AnchorHoverProps {
  anchorId: string;
  count: number;
  onClick: () => void;
}

export function AnchorHover({ anchorId, count, onClick }: AnchorHoverProps) {
  return (
    <button className="anchor-hover" aria-label={`Comments for ${anchorId}`} onClick={onClick}>
      💬
      {count > 0 && <span className="anchor-hover__badge">{count}</span>}
    </button>
  );
}
