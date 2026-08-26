const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function getCached(query) {
  const entry = cache.get(query.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(query.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCached(query, data) {
  cache.set(query.toLowerCase(), { data, timestamp: Date.now() });
}

export async function searchImages(query) {
  if (!process.env.IMAGE_API_KEY) {
    return [];
  }

  const cached = getCached(query);
  if (cached) return cached;

  try {
    const key = process.env.IMAGE_API_KEY;
    const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${key}`;
    const res = await fetch(url);

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`SerpApi request failed: ${res.status} ${res.statusText} — ${errorBody}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const results = (data.images_results || []).map(img => ({
      url: img.thumbnail,
      alt: img.title || query,
      source: img.link, // page the image came from — often pinterest.com itself
    })).filter(item => item.url).slice(0, 10);

    if (results.length === 0) {
      return [];
    }

    setCached(query, results);
    return results;

  } catch (err) {
    console.error("Image search failed :((", err.message);
    return [];
  }
}