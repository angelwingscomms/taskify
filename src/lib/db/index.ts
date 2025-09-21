// All Qdrant operations must use wait: true

import { QDRANT_KEY, QDRANT_URL } from '$env/static/private';
import { QdrantClient } from '@qdrant/js-client-rest';
import { collection } from '$lib/constants';
import type { User } from '$lib/types';
import { embed } from '$lib/util/embed';
import { new_id } from '$lib/util/new_id';

export type PayloadFilter = Record<string, unknown>;

// Qdrant client configuration
export const qdrant = new QdrantClient({
	url: QDRANT_URL || 'http://localhost:6333',
	apiKey: QDRANT_KEY
});

export async function getfirst<T>(filters: PayloadFilter): Promise<T | null> {
	const results = await search_by_payload<T>(filters, [], 1);
	if (results.length > 0) {
		return results[0];
	}
	return null;
}

// Utility functions
export { new_id } from '$lib/util/new_id';

export const set = async (id: string, payload: Record<string, unknown>) => {
	await qdrant.setPayload('i', {
		wait: true,
		payload,
		points: [id]
	});
};

// Database operations wrapper
export async function edit_point<T extends Record<string, unknown>>(
	i: string,
	data: T
): Promise<T & { i: string }> {
	const vector = new Array(3072).fill(0);

	await qdrant.setPayload(collection, {
		points: [i],
		payload: data,
		wait: true
	});

	await qdrant.updateVectors(collection, {
		points: [{ id: i, vector }]
	});

	return { ...data, i };
}

export async function create<T extends { s: string }>(
	payload: T,
	string_to_embed?: string,
	i?: string
): Promise<string> {
	const id = i || new_id();

	let vector: number[] = [];

	if (string_to_embed) {
		vector = await embed(string_to_embed);
	} else {
		vector = new Array(3072).fill(0);
	}

	await qdrant.upsert(collection, {
		points: [
			{
				id,
				payload,
				vector
			}
		],
		wait: true
	});

	return id;
}

export const format_filter = (
	must?: Record<string, unknown> | Array<Record<string, unknown>>,
	must_not?: Record<string, unknown> | Array<Record<string, unknown>>
) => {
	const normalize = (input?: Record<string, unknown> | Array<Record<string, unknown>>) => {
		if (!input) return undefined;
		if (Array.isArray(input)) return input;
		return Object.entries(input)
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([k, v]) => {
				if (typeof v === 'object' && v !== null) {
					const o = v as Record<string, unknown>;
					if ('match' in o || 'range' in o || 'in' in o || 'is_null' in o || 'has_id' in o) {
						return { key: k, ...(o as object) };
					}
				}
				return { key: k, match: { value: v } };
			});
	};

	const result: Record<string, unknown> = {};
	const m = normalize(must);
	if (m && m.length) result.must = m;
	const mn = normalize(must_not);
	if (mn && mn.length) result.must_not = mn;
	return result;
};

export async function count(filter: PayloadFilter): Promise<number> {
	try {
		const result = await qdrant.count(collection, {
			filter: format_filter(filter),
			exact: true
		});
		return result.count;
	} catch (error) {
		console.error('Error in count:', error);
		console.error('arg:', filter);
		throw error;
	}
}

export async function search_by_payload<T>(
	filter: PayloadFilter,
	with_payload?: string[] | boolean,
	limit?: number,
	order_by?: string | Record<string, string>
): Promise<T[]> {
	const actual_limit = limit || 144;
	try {
		let results;

		// If ordering is requested, use search with a dummy vector
		// Otherwise, use scroll for better performance
		if (order_by) {
			// Create a dummy vector for payload-only search
			const dummyVector = new Array(3072).fill(0);
			const orderByObj = typeof order_by === 'string' ? { key: order_by } : order_by;

			results = await qdrant.search(collection, {
				vector: dummyVector,
				limit: actual_limit,
				with_payload,
				filter: format_filter(filter),
				with_vector: false,
				...(orderByObj && { order_by: orderByObj })
			});
		} else {
			results = await qdrant.scroll(collection, {
				filter: format_filter(filter),
				limit: actual_limit,
				with_payload,
				with_vector: false
			});
		}

		// console.debug('search_by_payload results', results);

		// Handle both search and scroll result formats
		const points = 'points' in results ? results.points : results;
		return points.map((point) => ({
			...(point.payload as T),
			i: point.id
		}));
	} catch (error) {
		console.error('Error in search_by_payload:', error);
		console.error('arg:', filter, with_payload, limit, order_by);
		throw error;
	}
}

export async function search_by_vector<T>({
	vector,
	limit = 54,
	with_payload,
	filter
}: {
	vector: number[];
	with_payload?: string[];
	limit?: number;
	filter?: {
		must: Record<string, unknown>;
		must_not?: Record<string, unknown>;
	};
}): Promise<T[]> {
	const searchParams: Record<string, unknown> = {
		vector,
		limit,
		with_payload,
		with_vector: false
	};

	if (filter) {
		searchParams.filter = format_filter(filter.must, filter.must_not);
	}
	const results = await qdrant.search(
		collection,
		searchParams as {
			vector: number[] | { name: string; vector: number[] };
			limit?: number;
			with_payload?: boolean | string[];
			with_vector?: boolean;
			filter?: Record<string, unknown>;
		}
	);

	return results.map((point) => ({
		...(point.payload as T),
		i: point.id,
		score: point.score
	}));
}

export async function get<T>(
	id: string,
	payload?: string[] | string | boolean,
	with_vector?: boolean
): Promise<T | null> {
	try {
		const result = await qdrant.retrieve(collection, {
			ids: [id],
			with_payload: typeof payload === 'string' ? [payload] : payload,
			with_vector
		});

		if (result.length > 0) {
			const res = result[0].payload as T & {
				vector: number[];
			};
			if (with_vector && Array.isArray(result[0].vector)) {
				res.vector = result[0].vector as unknown as number[];
			} else if (payload && result[0].payload && typeof payload === 'string') {
				return result[0].payload[payload] as T;
			}
			return res;
		}
		return null;
	} catch {
		return null;
	}
}

export async function delete_by_id(id: string): Promise<void> {
	await qdrant.delete(collection, {
		points: [id],
		wait: true
	});
}

export async function update_point<T>(id: string, data: Partial<T>): Promise<void> {
	const existing = await get<T>(id);
	if (!existing) {
		throw new Error('Document not found');
	}

	await edit_point(id, { ...existing, ...data });
}

export const exists = async (i: string): Promise<boolean> => {
	return !!(await get(i, []));
};

// Get username from their ID
export async function get_username_from_id(userId: string): Promise<string> {
	const user = await get<{ u?: string }>(userId);

	if (user && user.u) {
		return user.u;
	}

	// If user not found, return Unknown User
	return 'Unknown User';
}

export const find_user_by_tag = async (t: string) => {
	return (await search_by_payload<User>({ s: 'u', t }))[0];
};

export const delete_ = async (id: string): Promise<void> => {
	await qdrant.delete(collection, {
		wait: true,
		points: [id]
	});
};
