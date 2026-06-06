export async function searchPexels(query, perPage = 15, page = 1) {
  const apiKey = window.__COLORIS_CONFIG__?.PEXELS_API_KEY;
  if (!apiKey) return [];

  try {
    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': apiKey },
    });
    if (!response.ok) return [];

    const data = await response.json();
    return (data.photos || []).map(photo => ({
      id: 'pexels-' + photo.id,
      url: photo.src?.original || '',
      thumbUrl: photo.src?.medium || photo.src?.small || '',
      smallUrl: photo.src?.small || '',
      author: photo.photographer || 'Unknown',
      authorUrl: photo.photographer_url || '#',
      alt: photo.alt || '',
      color: photo.avg_color || '',
      width: photo.width || 800,
      height: photo.height || 600,
      _pexels: true,
    }));
  } catch {
    return [];
  }
}

export async function searchPexelsByColor(hex, perPage = 15, page = 1) {
  return searchPexels('color ' + hex.replace('#', ''), perPage, page);
}
