import { useEffect, useState } from 'react';

type AuthMethod = 'pat' | 'app';

interface ContentSourceSettings {
  repositoryUrl?: string;
  branch: string;
  contentPath: string;
  authMethod: AuthMethod;
  pat?: string;
  appId?: string;
  appPrivateKey?: string;
  appInstallationId?: string;
}

interface EnvLocks {
  repositoryUrl: boolean;
  branch: boolean;
  contentPath: boolean;
  authMethod: boolean;
  pat: boolean;
  appId: boolean;
  appPrivateKey: boolean;
  appInstallationId: boolean;
}

const defaultSettings: ContentSourceSettings = {
  repositoryUrl: '',
  branch: 'main',
  contentPath: 'docs',
  authMethod: 'pat',
  pat: '',
  appId: '',
  appPrivateKey: '',
  appInstallationId: '',
};

export function ContentSourceSettings() {
  const [form, setForm] = useState<ContentSourceSettings>(defaultSettings);
  const [envLocks, setEnvLocks] = useState<EnvLocks>({
    repositoryUrl: false,
    branch: false,
    contentPath: false,
    authMethod: false,
    pat: false,
    appId: false,
    appPrivateKey: false,
    appInstallationId: false,
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({ type: 'idle' });
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, envRes] = await Promise.all([
          fetch('/api/admin/settings/content-source', { credentials: 'include' }),
          fetch('/api/admin/settings/env-status', { credentials: 'include' }),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setForm({ ...defaultSettings, ...data.data });
        }

        if (envRes.ok) {
          const envData = await envRes.json();
          setEnvLocks(envData.data.github);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    };

    load();
  }, []);

  const updateField = (field: keyof ContentSourceSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setStatus({ type: 'saving' });
    try {
      const response = await fetch('/api/admin/settings/content-source', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
      setStatus({ type: 'saved', message: 'Settings saved' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Testing connection...');
    const response = await fetch('/api/admin/sync/test-connection', {
      method: 'POST',
      credentials: 'include',
    });
    const result = await response.json();
    if (result.data?.success) {
      setTestResult('Connection successful.');
    } else {
      setTestResult(`Connection failed: ${result.data?.error ?? 'Unknown error'}`);
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div>
          <h2>Content Source</h2>
          <p>Connect LittleHelper to your GitHub repository containing markdown content.</p>
        </div>
        <div className="settings-section__actions">
          <button className="button button--secondary" onClick={handleTestConnection}>
            Test Connection
          </button>
          <button className="button button--primary" onClick={handleSave} disabled={status.type === 'saving'}>
            {status.type === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <label className="form-field">
          <span>Repository URL</span>
          <input
            type="text"
            value={form.repositoryUrl ?? ''}
            onChange={(e) => updateField('repositoryUrl', e.target.value)}
            disabled={envLocks.repositoryUrl}
            placeholder="https://github.com/org/repo.git"
          />
          {envLocks.repositoryUrl && <small className="env-lock">Configured via environment</small>}
        </label>

        <label className="form-field">
          <span>Branch</span>
          <input
            type="text"
            value={form.branch}
            onChange={(e) => updateField('branch', e.target.value)}
            disabled={envLocks.branch}
            placeholder="main"
          />
          {envLocks.branch && <small className="env-lock">Configured via environment</small>}
        </label>

        <label className="form-field">
          <span>Content Folder Path</span>
          <input
            type="text"
            value={form.contentPath}
            onChange={(e) => updateField('contentPath', e.target.value)}
            disabled={envLocks.contentPath}
            placeholder="docs"
          />
          {envLocks.contentPath && <small className="env-lock">Configured via environment</small>}
        </label>
      </div>

      <div className="form-field">
        <span>Authentication Method</span>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="authMethod"
              value="pat"
              checked={form.authMethod === 'pat'}
              onChange={() => updateField('authMethod', 'pat')}
              disabled={envLocks.authMethod}
            />
            Personal Access Token (PAT)
          </label>
          <label>
            <input
              type="radio"
              name="authMethod"
              value="app"
              checked={form.authMethod === 'app'}
              onChange={() => updateField('authMethod', 'app')}
              disabled={envLocks.authMethod}
            />
            GitHub App
          </label>
        </div>
        {envLocks.authMethod && <small className="env-lock">Configured via environment</small>}
      </div>

      {form.authMethod === 'pat' ? (
        <label className="form-field">
          <span>Personal Access Token</span>
          <input
            type="password"
            value={form.pat ?? ''}
            onChange={(e) => updateField('pat', e.target.value)}
            disabled={envLocks.pat}
            placeholder="ghp_..."
          />
          {envLocks.pat && <small className="env-lock">Configured via environment</small>}
        </label>
      ) : (
        <div className="settings-grid">
          <label className="form-field">
            <span>App ID</span>
            <input
              type="text"
              value={form.appId ?? ''}
              onChange={(e) => updateField('appId', e.target.value)}
              disabled={envLocks.appId}
            />
            {envLocks.appId && <small className="env-lock">Configured via environment</small>}
          </label>
          <label className="form-field">
            <span>App Private Key</span>
            <textarea
              value={form.appPrivateKey ?? ''}
              onChange={(e) => updateField('appPrivateKey', e.target.value)}
              disabled={envLocks.appPrivateKey}
              rows={3}
            />
            {envLocks.appPrivateKey && <small className="env-lock">Configured via environment</small>}
          </label>
          <label className="form-field">
            <span>Installation ID</span>
            <input
              type="text"
              value={form.appInstallationId ?? ''}
              onChange={(e) => updateField('appInstallationId', e.target.value)}
              disabled={envLocks.appInstallationId}
            />
            {envLocks.appInstallationId && <small className="env-lock">Configured via environment</small>}
          </label>
        </div>
      )}

      {testResult && <div className="notice">{testResult}</div>}
      {status.type === 'error' && <div className="notice notice--error">{status.message}</div>}
      {status.type === 'saved' && <div className="notice notice--success">{status.message}</div>}
    </div>
  );
}
