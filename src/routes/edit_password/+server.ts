import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { update_point } from '$lib/db';
import { internal_error } from '$lib/util/internal_error';

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) error(401);
		await update_point(locals.user.i, {ph: await request.text()});
		return new Response()
	} catch (e) {
		console.error('error editing user', e);
		error(500, 'we had an error on our side, error:' + e)
	}
};
