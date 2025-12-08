import { useMemo, useState } from 'react';
import { Button } from '@littlehelper/ui';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { Badge } from '../components/Badge.js';

type Role = 'Admin' | 'User';
type Status = 'Active' | 'Banned';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastLogin: string;
  avatarUrl?: string;
}

const seedUsers: UserRecord[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2h ago',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'User',
    status: 'Active',
    lastLogin: '1d ago',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'User',
    status: 'Banned',
    lastLogin: '3d ago',
  },
];

export function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(seedUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [confirmAction, setConfirmAction] = useState<{
    user?: UserRecord;
    type?: 'role' | 'ban';
    nextRole?: Role;
  }>({});

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const updateRole = (userId: string, nextRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
  };

  const updateStatus = (userId: string, nextStatus: Status) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-description">Manage users, roles, and access.</p>
        </div>
        <div className="users-page__filters">
          <input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}>
            <option value="all">All roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
          >
            <option value="all">All status</option>
            <option value="Active">Active</option>
            <option value="Banned">Banned</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table className="responsive-table users-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td data-label="Avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="users-table__avatar" />
                  ) : (
                    <div className="users-table__avatar users-table__avatar--placeholder">
                      {user.name[0]}
                    </div>
                  )}
                </td>
                <td data-label="Name">
                  <div className="users-table__name">{user.name}</div>
                </td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      setConfirmAction({
                        user,
                        type: 'role',
                        nextRole: e.target.value as Role,
                      })
                    }
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                </td>
                <td data-label="Status">
                  <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>
                    {user.status}
                  </Badge>
                </td>
                <td data-label="Last Login">{user.lastLogin}</td>
                <td data-label="Actions">
                  <Button
                    variant={user.status === 'Active' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() =>
                      setConfirmAction({
                        user,
                        type: 'ban',
                      })
                    }
                  >
                    {user.status === 'Active' ? 'Ban' : 'Unban'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="empty-state">No users found with current filters.</div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(confirmAction.user)}
        onCancel={() => setConfirmAction({})}
        onConfirm={() => {
          if (!confirmAction.user || !confirmAction.type) return;
          if (confirmAction.type === 'role' && confirmAction.nextRole) {
            updateRole(confirmAction.user.id, confirmAction.nextRole);
          }
          if (confirmAction.type === 'ban') {
            updateStatus(
              confirmAction.user.id,
              confirmAction.user.status === 'Active' ? 'Banned' : 'Active'
            );
          }
          setConfirmAction({});
        }}
        confirmLabel={
          confirmAction.type === 'ban'
            ? confirmAction.user?.status === 'Active'
              ? 'Ban User'
              : 'Unban User'
            : 'Change Role'
        }
        destructive={confirmAction.type === 'ban' && confirmAction.user?.status === 'Active'}
        title={
          confirmAction.type === 'ban'
            ? `${confirmAction.user?.status === 'Active' ? 'Ban' : 'Unban'} ${confirmAction.user?.name}?`
            : `Change ${confirmAction.user?.name}'s role?`
        }
        description={
          confirmAction.type === 'ban'
            ? confirmAction.user?.status === 'Active'
              ? 'They will be unable to login or comment.'
              : 'They will regain access to the site.'
            : `Role will be updated to ${confirmAction.nextRole}.`
        }
      />
    </div>
  );
}
