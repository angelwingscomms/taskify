import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const user_id = user.id;

	try {
		// Delete the user's own document
		await db.delete_points_by_payload('i', { u: user_id, s: 'u' });

		// Delete tasks solely linked to this user (assuming 't' for task and 'u' for user_id on tasks)
		// This needs to be carefully designed based on how tasks are linked.
		// If tasks are truly "linked solely" this implies they have a 'u' field with the user_id.
		await db.delete_points_by_payload('i', { u: user_id, s: 't' });

		return json({ message: 'Account and associated data deleted successfully' });
	} catch (e) {
		console.error('Error deleting account:', e);
		throw error(500, 'An error occurred while deleting your account.');
	}
};
