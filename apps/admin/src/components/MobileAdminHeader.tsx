interface MobileAdminHeaderProps {
  onMenuClick: () => void;
}

export function MobileAdminHeader({ onMenuClick }: MobileAdminHeaderProps) {
  return (
    <div className="mobile-admin-header">
      <button className="mobile-admin-header__menu" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>
      <span className="mobile-admin-header__title">Admin</span>
    </div>
  );
}
