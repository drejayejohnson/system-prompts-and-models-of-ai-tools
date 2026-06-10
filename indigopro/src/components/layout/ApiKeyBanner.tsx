'use client';

import { useState, useEffect } from 'react';

export function ApiKeyBanner() {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => { if (!data.hasApiKey) setMissing(true); })
      .catch(() => {});
  }, []);

  if (!missing) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-3 text-sm text-amber-800">
      <span className="text-base">⚠️</span>
      <span>
        <strong>Setup required:</strong> ANTHROPIC_API_KEY is not set.
        Copy <code className="bg-amber-100 px-1 rounded">.env.local.example</code> to{' '}
        <code className="bg-amber-100 px-1 rounded">.env.local</code> and add your API key, then restart.
      </span>
    </div>
  );
}
