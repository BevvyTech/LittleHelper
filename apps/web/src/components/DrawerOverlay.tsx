interface DrawerOverlayProps {
  open: boolean;
  onClick: () => void;
}

export function DrawerOverlay({ open, onClick }: DrawerOverlayProps) {
  return (
    <button
      type="button"
      className={`drawer-overlay ${open ? 'is-visible' : ''}`}
      aria-hidden={!open}
      onClick={onClick}
    >
      <span className="sr-only">Close menu</span>
    </button>
  );
}
