'use client';

import { useEffect, useState } from 'react';
import { VISITOR_OPT_OUT_KEY, visitorOptedOut } from '@/lib/visitor-preferences';

export function VisitorPreference() {
  const [excluded, setExcluded] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    try { setExcluded(visitorOptedOut(navigator, window.localStorage)); }
    catch { setExcluded(true); }
  }, []);
  function exclude() {
    try {
      window.localStorage.setItem(VISITOR_OPT_OUT_KEY, '1');
      setExcluded(true);
      setMessage('Future visits from this browser will not be recorded.');
    } catch { setMessage('Your browser blocked this preference. Enable Do Not Track or Global Privacy Control to opt out.'); }
  }
  return <div>
    <button type="button" disabled={excluded === null || excluded} onClick={exclude}>
      {excluded ? 'This browser is excluded from visitor records' : 'Exclude this browser from visitor records'}
    </button>
    <p role="status">{message}</p>
  </div>;
}
