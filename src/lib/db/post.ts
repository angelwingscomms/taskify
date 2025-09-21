import { get, qdrant } from './index';
import { create } from './index';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import type { Post } from '$lib/types';
import { summarize } from '$lib/ai/summarize';

export const create_post = async (
	user_id: string
): Promise<string> => {
	return create(
		{ s: 'p', u: user_id, d: Date.now() },
		''
	);
};

export const update_post = async (
	id: string,
	data: Partial<Post>
): Promise<void> => {
	const existing = await get<Post>(id);
	if (!existing) {
		throw new Error('Post not found');
	}
	let base_data = { ...existing, ...data };
	const update_data =
		data.b && !base_data.y
			? { ...base_data, y: await summarize(data.b) }
			: base_data;
	const embed_text = JSON.stringify({
		body: update_data.b,
		title: update_data.t,
		summary: update_data.y
	});
	let vector = new Array(3072).fill(0);
	if (embed_text) {
		vector = await embed(embed_text);
	}
	await qdrant.setPayload(collection, {
		points: [id],
		payload: update_data,
		wait: true
	});
	await qdrant.updateVectors(collection, {
		points: [{ id, vector }]
	});
};
