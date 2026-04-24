import type { GeoApiRange, GeoApiResponse } from "./mock-data";

export type GeoApiRequestOptions = {
  brandId?: string;
  range?: GeoApiRange;
};

export function buildGeoApiUrl(options: GeoApiRequestOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.brandId) {
    searchParams.set("brandId", options.brandId);
  }

  if (options.range) {
    searchParams.set("range", options.range);
  }

  const query = searchParams.toString();

  return query ? `/api/geo?${query}` : "/api/geo";
}

export async function fetchGeoApiData(
  options: GeoApiRequestOptions = {},
): Promise<GeoApiResponse> {
  const response = await fetch(buildGeoApiUrl(options), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GEO API request failed with status ${response.status}`);
  }

  return (await response.json()) as GeoApiResponse;
}
