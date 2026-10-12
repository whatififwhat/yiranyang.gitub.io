export const VISITOR_OPT_OUT_KEY = 'yiran-visitor-records-opt-out';

export function visitorOptedOut(browser: { doNotTrack?: string | null; globalPrivacyControl?: boolean }, storage: Pick<Storage, 'getItem'>): boolean {
  if (browser.doNotTrack === '1' || browser.globalPrivacyControl === true) return true;
  try { return storage.getItem(VISITOR_OPT_OUT_KEY) === '1'; }
  catch { return true; } // If preferences cannot be read, do not collect.
}
