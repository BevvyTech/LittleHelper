interface AssetBrowserProps {
  assets: { name: string; url: string }[];
  onSelect: (assetUrl: string) => void;
  onClose: () => void;
}

export function AssetBrowser({ assets, onSelect, onClose }: AssetBrowserProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal modal--large" role="dialog" aria-modal="true" aria-label="Asset browser">
        <div className="modal__header">
          <h3>Assets</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close asset browser">
            X
          </button>
        </div>
        <div className="modal__body asset-browser__grid">
          {assets.map((asset) => (
            <button
              key={asset.url}
              className="asset-browser__item"
              onClick={() => onSelect(asset.url)}
            >
              <img src={asset.url} alt={asset.name} />
              <span>{asset.name}</span>
            </button>
          ))}
          {assets.length === 0 && <div className="asset-browser__empty">No assets uploaded yet.</div>}
        </div>
      </div>
    </div>
  );
}
