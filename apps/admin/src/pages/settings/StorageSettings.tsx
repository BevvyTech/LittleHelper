import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@littlehelper/ui';
import { ImageUploader } from '../../components/ImageUploader.js';
import { AssetBrowser } from '../../components/AssetBrowser.js';

type StorageType = 'local' | 's3';

interface StorageForm {
  storageType: StorageType;
  localPath: string;
  s3Endpoint: string;
  s3Bucket: string;
  s3Region: string;
  accessKey: string;
  secretKey: string;
  publicUrl: string;
  secureMode: boolean;
}

const initialForm: StorageForm = {
  storageType: 'local',
  localPath: '/uploads',
  s3Endpoint: '',
  s3Bucket: '',
  s3Region: '',
  accessKey: '',
  secretKey: '',
  publicUrl: '',
  secureMode: true,
};

export function StorageSettings() {
  const [form, setForm] = useState<StorageForm>(initialForm);
  const [status, setStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [assets, setAssets] = useState<{ name: string; url: string }[]>([]);
  const [showBrowser, setShowBrowser] = useState(false);

  const envLocked = useMemo(
    () => ({
      repoUrl: Boolean(import.meta.env.VITE_CONTENT_REPO_URL),
    }),
    []
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setStatus('Settings saved (local-only mock).');
  };

  const onTestConnection = async () => {
    setTesting(true);
    setStatus(null);
    setTimeout(() => {
      setTesting(false);
      setStatus('Connection successful.');
    }, 600);
  };

  return (
    <form className="settings-section" onSubmit={onSubmit}>
      <div className="settings-section__header">
        <div>
          <h2>Storage</h2>
          <p className="muted">
            Configure uploads for images and assets. Test connection before saving.
          </p>
        </div>
        <div className="settings-section__actions">
          <Button variant="secondary" type="button" onClick={onTestConnection} disabled={testing}>
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </div>

      {status && <div className="notice notice--success">{status}</div>}

      <div className="form-field">
        <label>Storage Type *</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="storage-type"
              value="local"
              checked={form.storageType === 'local'}
              onChange={() => setForm((prev) => ({ ...prev, storageType: 'local' }))}
            />{' '}
            Local
          </label>
          <label>
            <input
              type="radio"
              name="storage-type"
              value="s3"
              checked={form.storageType === 's3'}
              onChange={() => setForm((prev) => ({ ...prev, storageType: 's3' }))}
            />{' '}
            S3
          </label>
        </div>
      </div>

      <div className="settings-grid">
        {form.storageType === 'local' ? (
          <div className="form-field">
            <label>Local Path *</label>
            <input
              type="text"
              value={form.localPath}
              onChange={(e) => setForm((prev) => ({ ...prev, localPath: e.target.value }))}
              placeholder="/uploads"
              required
            />
          </div>
        ) : (
          <>
            <div className="form-field">
              <label>S3 Endpoint *</label>
              <input
                type="url"
                value={form.s3Endpoint}
                onChange={(e) => setForm((prev) => ({ ...prev, s3Endpoint: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>S3 Bucket *</label>
              <input
                type="text"
                value={form.s3Bucket}
                onChange={(e) => setForm((prev) => ({ ...prev, s3Bucket: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>S3 Region *</label>
              <input
                type="text"
                value={form.s3Region}
                onChange={(e) => setForm((prev) => ({ ...prev, s3Region: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Access Key *</label>
              <input
                type="password"
                value={form.accessKey}
                onChange={(e) => setForm((prev) => ({ ...prev, accessKey: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Secret Key *</label>
              <input
                type="password"
                value={form.secretKey}
                onChange={(e) => setForm((prev) => ({ ...prev, secretKey: e.target.value }))}
                required
              />
            </div>
          </>
        )}

        <div className="form-field">
          <label>Public URL Prefix</label>
          <input
            type="url"
            value={form.publicUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, publicUrl: e.target.value }))}
            placeholder="https://cdn.example.com/"
          />
        </div>

        <div className="form-field form-field--inline">
          <label>Secure Mode</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={form.secureMode}
              onChange={(e) => setForm((prev) => ({ ...prev, secureMode: e.target.checked }))}
            />
            <span className="switch__slider" />
          </label>
        </div>

        <div className="form-field env-locked">
          <label>Repository URL</label>
          <input
            type="text"
            value={import.meta.env.VITE_CONTENT_REPO_URL ?? ''}
            placeholder="Configured via env"
            disabled
          />
          {envLocked.repoUrl && <p className="env-lock">Configured via environment variable</p>}
        </div>
      </div>

      <div className="settings-section__divider" />

      <div className="settings-grid">
        <div className="form-field">
          <label>Upload Test</label>
          <ImageUploader
            onUpload={async (file, previewUrl) => {
              setAssets((prev) => [{ name: file.name, url: previewUrl }, ...prev]);
            }}
          />
        </div>
        <div className="form-field">
          <label>Asset Browser</label>
          <Button variant="secondary" type="button" onClick={() => setShowBrowser(true)}>
            Browse Assets
          </Button>
          <p className="muted">Select an existing upload to insert into content.</p>
        </div>
      </div>

      {showBrowser && (
        <AssetBrowser
          assets={assets}
          onSelect={(url) => {
            setStatus(`Selected asset ${url}`);
            setShowBrowser(false);
          }}
          onClose={() => setShowBrowser(false)}
        />
      )}
    </form>
  );
}
