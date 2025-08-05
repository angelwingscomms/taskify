import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get, update_point } from '$lib/db';
import { hash, verify } from 'argon2';

export const PUT: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) error(401, 'not logged in');
		
		const u = await get<{ ph: string }>(locals.user.i, ['ph']);
		if (!u) error(404, 'user not found');
		
		const data = await request.json();
		console.log('aa', u, data);
		if (await verify(u.ph, data.c)) {
			await update_point(locals.user.i, { ph: await hash(data.p) });
		} else {
			error(401, "that's not your current password");
		}
		return new Response();
	} catch (e) {
		console.error('error editing user', e);
		error(500, 'we had an error on our side, error:' + e);
	}
};
