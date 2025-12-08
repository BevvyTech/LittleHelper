import { useEffect, useState } from 'react';

interface AiSettingsState {
  geminiApiKey?: string;
  enabled: boolean;
  autoGenerateSeo: boolean;
}

export function AiSettings() {
  const [form, setForm] = useState<AiSettingsState>({
    geminiApiKey: '',
    enabled: false,
    autoGenerateSeo: false,
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings/ai', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setForm((prev) => ({ ...prev, ...data.data }));
        }
      } catch (error) {
        console.error('Failed to load AI settings', error);
      }
    };
    void load();
  }, []);

  const updateField = (field: keyof AiSettingsState, value: boolean | string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setStatus('saving');
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings/ai', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      setStatus('saved');
      setMessage('Settings saved');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to save');
    }
  };

  const handleTest = async () => {
    setTestResult('Testing...');
    try {
      const res = await fetch('/api/admin/seo/test-connection', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.data?.success) {
        setTestResult('Gemini connection successful');
      } else {
        setTestResult(`Failed: ${data.data?.error ?? 'Unknown error'}`);
      }
    } catch (error) {
      setTestResult(error instanceof Error ? error.message : 'Test failed');
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <div>
          <h2>AI Integrations</h2>
          <p>Configure Gemini for SEO summaries and keywords.</p>
        </div>
        <div className="settings-section__actions">
          <button className="button button--secondary" onClick={handleTest}>
            Test Connection
          </button>
          <button
            className="button button--primary"
            onClick={handleSave}
            disabled={status === 'saving'}
          >
            {status === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <label className="form-field">
          <span>Gemini API Key</span>
          <input
            type="password"
            value={form.geminiApiKey ?? ''}
            onChange={(e) => updateField('geminiApiKey', e.target.value)}
            placeholder="AIza..."
          />
        </label>
        <label className="form-field">
          <span>Enable AI features</span>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => updateField('enabled', e.target.checked)}
          />
        </label>
        <label className="form-field">
          <span>Auto-generate on sync</span>
          <input
            type="checkbox"
            checked={form.autoGenerateSeo}
            onChange={(e) => updateField('autoGenerateSeo', e.target.checked)}
          />
        </label>
      </div>

      {message && <div className="notice notice--success">{message}</div>}
      {testResult && <div className="notice">{testResult}</div>}
      {status === 'error' && <div className="notice notice--error">{message}</div>}
    </div>
  );
}
