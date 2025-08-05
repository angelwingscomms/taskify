import { fail, redirect } from '@sveltejs/kit';
import { hash_password, verify_password } from '$lib/server/auth';
import { edit_point, search_by_payload, PayloadFilter } from '$lib/db';
import type { User } from '$lib/types';

// Helper function to get user by email directly within this file
async function get_user_by_email(email: string): Promise<User | null> {
	const search_results = await search_by_payload<User>({ s: 'u', e: email } as PayloadFilter, 1);

	if (search_results.length > 0) {
		return { id: search_results[0].id, ...search_results[0].payload } as User;
	}
	return null;
}

export const actions = {
	authenticate: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();
		const confirm_password = data.get('confirm_password')?.toString(); // Only present for new accounts

		if (!email || !password) {
			return fail(400, { message: 'Email and password are required.' });
		}

		let is_new_account = data.get('is_new_account') === 'true'; // Hidden field to indicate mode

		if (is_new_account) {
			if (password !== confirm_password) {
				return fail(400, { message: 'Passwords do not match.' });
			}

			const existing_user = await get_user_by_email(email);
			if (existing_user) {
				return fail(409, { message: 'Account with this email already exists.' });
			}

			const password_hash = await hash_password(password);
			const user_id = crypto.randomUUID(); // Generate a unique user ID

			await edit_point({
				id: user_id,
				payload: {
					s: 'u', // user data type
					e: email,
					ph: password_hash
				},
				wait: true
			});

			cookies.set('sessionid', user_id, {
				path: '/',
				httpOnly: true,
				secure: true,
				maxAge: 60 * 60 * 24 * 7
			}); // 1 week
			throw redirect(303, '/');
		} else {
			// Login mode
			const user = await get_user_by_email(email);

			if (!user || !user.ph) {
				return fail(400, { message: 'Invalid email or password.' });
			}

			const password_matches = await verify_password(password, user.ph);

			if (!password_matches) {
				return fail(400, { message: 'Invalid email or password.' });
			}

			cookies.set('sessionid', user.id, {
				path: '/',
				httpOnly: true,
				secure: true,
				maxAge: 60 * 60 * 24 * 7
			}); // 1 week
			throw redirect(303, '/');
		}
	}
};
