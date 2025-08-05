import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { search_by_payload } from '$lib/db';
import { task_tenant_id } from '$lib/constants';
import { internal_error } from '$lib/util/internal_error';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/google');
	try {
		const t = await search_by_payload({ s: task_tenant_id, u: locals.user.i });
		return { t };
	} catch (e) {
		console.error('/ error:', e);
		internal_error();
	}
};
