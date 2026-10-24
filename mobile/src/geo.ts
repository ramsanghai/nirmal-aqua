// OpenStreetMap Nominatim (free, no key). Keep requests light: user-triggered only.
const H = { 'User-Agent': 'NirmalAqua/1.0 (assignment app)', 'Accept-Language': 'en' };

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, { headers: H });
    const j = await r.json();
    return j.display_name || '';
  } catch { return ''; }
}

export async function searchPlace(q: string): Promise<{ lat: number; lng: number; name: string }[]> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(q)}`, { headers: H });
    const j = await r.json();
    return j.map((x: any) => ({ lat: +x.lat, lng: +x.lon, name: x.display_name }));
  } catch { return []; }
}
