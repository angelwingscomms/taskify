import { search_by_payload, search_by_vector } from '$lib/db';
import { embed } from '$lib/util/embed';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const search = await request.json();
	if (search.s) {
		return json(
			await search_by_vector({
				limit: 9,
				filter: { u: locals.user.i, ...search.f },
				vector: await embed(search.s)
			})
		);
	} else {
		return json(
			await search_by_payload({
				limit: 9,
				filter: { u: locals.user.i, ...search.f }
			})
		);
	}
};
