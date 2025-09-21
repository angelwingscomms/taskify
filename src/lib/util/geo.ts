export const EARTH_RADIUS_M = 6371000;
export const MILES_TO_METERS = 1609.344;

export function to_meters(
	radius: number,
	unit: 'meters' | 'miles' = 'meters'
) {
	return unit === 'miles'
		? radius * MILES_TO_METERS
		: radius;
}

export function bbox(
	lat: number,
	lon: number,
	radius_m: number
) {
	const lat_delta =
		(radius_m / EARTH_RADIUS_M) * (180 / Math.PI);
	const lon_delta =
		lat_delta / Math.cos((lat * Math.PI) / 180);
	return {
		minLat: lat - lat_delta,
		maxLat: lat + lat_delta,
		minLon: lon - lon_delta,
		maxLon: lon + lon_delta
	};
}

export function haversine_m(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) {
	const toRad = (v: number) => (v * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) *
			Math.cos(toRad(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c =
		2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return EARTH_RADIUS_M * c;
}
