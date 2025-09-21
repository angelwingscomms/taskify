import { json, error } from '@sveltejs/kit';
import { qdrant } from '$lib/db';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const user_id = user.id;

	try {
		// Delete the user's own document
		await qdrant.delete('i', {
			filter: {
				must: [
					{ key: 'u', match: { value: user_id } },
					{ key: 's', match: { value: 'u' } }
				]
			}
		});

		// Delete tasks solely linked to this user
		await qdrant.delete('i', {
			filter: {
				must: [
					{ key: 'u', match: { value: user_id } },
					{ key: 's', match: { value: 't' } }
				]
			}
		});

		return json({ message: 'Account and associated data deleted successfully' });
	} catch (e) {
		console.error('Error deleting account:', e);
		throw error(500, 'An error occurred while deleting your account.');
	}
};
