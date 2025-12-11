import { useState } from 'react';

export interface PageTreeNode {
  id: string;
  shortId: string;
  parentId: string | null;
  headerImage: string | null;
  locales: Array<{
    id: string;
    locale: string;
    title: string;
    slug: string;
    markdownPath: string;
  }>;
  children: PageTreeNode[];
}

interface PageTreeProps {
  nodes: PageTreeNode[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
}

export function PageTree({ nodes, onSelect, selectedId }: PageTreeProps) {
  return (
    <div className="page-tree">
      {nodes.map((node) => (
        <PageTreeItem
          key={node.id}
          node={node}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

function PageTreeItem({
  node,
  onSelect,
  selectedId,
}: {
  node: PageTreeNode;
  onSelect: (id: string) => void;
  selectedId?: string | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const title = node.locales[0]?.title ?? 'Untitled';

  return (
    <div className="page-tree__item">
      <div
        className={`page-tree__row ${selectedId === node.id ? 'is-selected' : ''}`}
        onClick={() => onSelect(node.id)}
      >
        {node.children.length > 0 ? (
          <button
            className="page-tree__toggle"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="page-tree__spacer" />
        )}
        <div className="page-tree__title">
          <span className="page-tree__label">{title}</span>
          <span className="page-tree__slug">/{node.locales[0]?.slug ?? ''}</span>
        </div>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="page-tree__children">
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
