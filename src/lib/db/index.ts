// All Qdrant operations must use wait: true

import { QDRANT_KEY, QDRANT_URL } from '$env/static/private';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v7 as uuidv7 } from 'uuid';
import { collection } from '$lib/constants';
import type { User } from '$lib/types';
import { embed } from '$lib/util/embed';

export interface PayloadFilter extends Record<string, unknown> {}

// Qdrant client configuration
export const qdrant = new QdrantClient({
	url: QDRANT_URL || 'http://localhost:6333',
	apiKey: QDRANT_KEY
});

export async function getfirst<T>(filters: PayloadFilter): Promise<T | null> {
	const results = await search_by_payload<T>(filters, 1);
	if (results.length > 0) {
		return results[0];
	}
	return null;
}

// Utility functions
export function generateId(): string {
	return uuidv7();
}

export const set = async (id: string, payload: Record<string, unknown>) => {
	await qdrant.setPayload('i', {
		wait: true,
		payload,
		points: [id]
	});
};

// Database operations wrapper
export async function edit_point<T extends { i?: string; s: string }>(
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

export const format_filters = (filters: PayloadFilter) => {
	return {
		must: Object.entries(filters)
			.filter(([, value]) => value !== undefined && value !== null && value !== '')
			.map(([key, value]) => ({
				key,
				match: { value }
			}))
	};
};

export async function search_by_payload<T>(filters: PayloadFilter, limit?: number): Promise<T[]> {
	const actual_limit = limit || 144;
	try {
		const results = await qdrant.scroll(collection, {
			filter: format_filters(filters),
			limit: actual_limit,
			with_payload: true,
			with_vector: false
		});

		// console.debug('search_by_payload results', results);

		return results.points.map((point) => ({ ...(point.payload as T), i: point.id }));
	} catch (error) {
		console.error('Error in search_by_payload:', error);
		console.error('Filters:', filters);
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
			searchParams.filter = format_filters(filter);
		}

		const results = await qdrant.search(collection, searchParams);

		return results.map((point) => ({ ...(point.payload as T), i: point.id }));
	} catch (error) {
		console.error('Error in search_by_vector:', error);
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

export async function delete_by_id(id: string): Promise<void> {
	await qdrant.delete(collection, {
		points: [id],
		wait: true
	});
}

export async function update_point<T extends { id: string; s: string }>(
	id: string,
	data: Partial<T>
): Promise<void> {
	const existing = await get<T>(id);
	if (!existing) {
		throw new Error('Document not found');
	}

	await edit_point({ ...existing, ...data, id });
}

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
