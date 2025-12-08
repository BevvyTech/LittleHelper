import { Button } from '@littlehelper/ui';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__search">
        {/* Search placeholder */}
      </div>

      <div className="topbar__actions">
        {/* Status indicators placeholder */}
        <div className="topbar__user">
          <Button variant="ghost" size="sm">
            User Menu
          </Button>
        </div>
      </div>
    </header>
  );
}
