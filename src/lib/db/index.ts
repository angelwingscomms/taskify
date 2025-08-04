// All Qdrant operations must use wait: true

import { QDRANT_KEY, QDRANT_URL } from '$env/static/private';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v7 as uuidv7 } from 'uuid';
import { collection } from '$lib/constants';
import type { User } from '$lib/types';

// Qdrant client configuration
export const qdrant = new QdrantClient({
	url: QDRANT_URL || 'http://localhost:6333',
	apiKey: QDRANT_KEY
});

// Utility functions
export function generateId(): string {
	return uuidv7();
}

export const updateById = async (id: string, payload: Record<string, unknown>) => {
	await qdrant.setPayload('i', {
		wait: true,
		payload,
		points: [id]
	});
};

// Database operations wrapper
export async function upsertPoint<T extends { i?: string; s: string }>(
	data: T
): Promise<T & { i: string }> {
	const i = data.i || generateId();

	const vector = new Array(3072).fill(0);

	await qdrant.upsert(collection, {
		points: [
			{
				id: i,
				payload: { ...data },
				vector
			}
		],
		wait: true
	});

	return { ...data, i };
}

export async function create<T extends { i?: string; id?: string; s: string }>(
	payload: T,
	string_to_embed: string
): Promise<string> {
	const id = generateId();

	let vector: number[] = new Array(768).fill(0);

	if (string_to_embed) {
		// TODO: Implement proper embedding generation
		vector = new Array(768).fill(0);
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

export async function searchByPayload<T>(
	filters: Record<string, unknown>,
	limit: number = 144
): Promise<T[]> {
	const mustFilters = Object.entries(filters)
		.filter(([, value]) => value !== undefined && value !== null && value !== '')
		.map(([key, value]) => ({
			key,
			match: { value }
		}));

	// If no valid filters, return empty array
	if (mustFilters.length === 0) {
		return [];
	}

	try {
		const results = await qdrant.scroll(collection, {
			filter: {
				must: mustFilters
			},
			limit,
			with_payload: true,
			with_vector: false
		});

		// console.debug('searchByPayload results', results);

		return results.points.map((point) => ({ ...(point.payload as T), i: point.id }));
	} catch (error) {
		console.error('Error in searchByPayload:', error);
		console.error('Filters:', filters);
		console.error('Must filters:', mustFilters);
		throw error;
	}
}

export async function searchByVector<T>({
	vector,
	limit = 54,
	with_payload,
	filter
}: {
	vector: number[];
	with_payload?: string[],
	limit?: number;
	filter?: Record<string, unknown>;
}): Promise<T[]> {
	try {
		const searchParams: Record<string, unknown> = {
			vector,
			limit,
			with_payload,
			with_vector: false
		};

		if (filter) {
			searchParams.filter = filter;
		}

		const results = await qdrant.search(collection, searchParams);

		return results.map((point) => ({...point.payload as T, i: point.id}));
	} catch (error) {
		console.error('Error in searchByVector:', error);
		console.error('Vector length:', vector.length);
		console.error('Filter:', filter);
		throw error;
	}
}

export async function get<T>(
	id: string,
	payload?: string[],
	with_vector?: boolean
): Promise<T | null> {
	try {
		const result = await qdrant.retrieve(collection, {
			ids: [id],
			with_payload: payload ? payload : true,
			with_vector
		});

		if (result.length > 0) {
			const res = result[0].payload as T & { vector: number[] };
			if (with_vector) {
				res.vector = result[0].vector;
			}
			return res;
		}
		return null;
	} catch {
		return null;
	}
}

export async function deleteById(id: string): Promise<void> {
	await qdrant.delete(collection, {
		points: [id],
		wait: true
	});
}

export async function updatePoint<T extends { id: string; s: string }>(
	id: string,
	data: Partial<T>
): Promise<void> {
	const existing = await get<T>(id);
	if (!existing) {
		throw new Error('Document not found');
	}

	await upsertPoint({ ...existing, ...data, id });
}

// Get username from their ID
export async function getUsernameFromId(userId: string): Promise<string> {
	const user = await get<{ u?: string }>(userId);

	if (user && user.u) {
		return user.u;
	}

	// If user not found, return Unknown User
	return 'Unknown User';
}

export const find_user_by_tag = async (t: string) => {
	return (await searchByPayload<User>({ s: 'u', t }))[0];
};

export const delete_ = async (id: string): Promise<void> => {
	await qdrant.delete(collection, {
		wait: true,
		points: [id]
	});
};
