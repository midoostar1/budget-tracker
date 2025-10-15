const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;
export async function apiGet(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
