import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchByPayload } from '$lib/db';
import { task_tenant_id } from '$lib/constants';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/google');
	try {
		const tasks = await searchByPayload({ s: task_tenant_id, u: locals.user.i });
		return { tasks };
	} catch (e) {
		console.error('/ error:', e);
		error(500)
	}
};
