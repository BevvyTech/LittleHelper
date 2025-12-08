import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReleaseOption {
  tag: string;
  name: string;
}

interface VersionSelectorProps {
  currentLocale: string;
  currentSlug: string;
  currentTag?: string;
}

export function VersionSelector({ currentLocale, currentSlug, currentTag }: VersionSelectorProps) {
  const [releases, setReleases] = useState<ReleaseOption[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/releases');
        const data = await res.json();
        setReleases(data.data ?? []);
      } catch (error) {
        console.error('Failed to load releases', error);
      }
    };
    void load();
  }, []);

  const goTo = (tag: string | null) => {
    if (!tag || tag === 'latest') {
      navigate(`/${currentLocale}/${currentSlug}`);
      return;
    }
    navigate(`/releases/${tag}/${currentLocale}/${currentSlug}`);
  };

  return (
    <label className="version-selector">
      <span className="version-selector__label">Version</span>
      <select
        value={currentTag ?? 'latest'}
        onChange={(e) => goTo(e.target.value)}
        aria-label="Select version"
      >
        <option value="latest">Latest</option>
        {releases.map((release) => (
          <option key={release.tag} value={release.tag}>
            {release.name || release.tag}
          </option>
        ))}
      </select>
    </label>
  );
}
