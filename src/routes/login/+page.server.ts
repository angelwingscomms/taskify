import { hash, verify } from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { find_user_by_tag, getfirst } from '$lib/db';
import { create_user } from '$lib/auth';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('e') as string;
		const password = formData.get('p') as string;
		const isNewUser = formData.get('n');
		console.log(isNewUser)

		// Conditional logic based on is_new_user
		if (isNewUser === 'true') {
			// Register path
			const existingUser = await getfirst({ e: email });
			if (existingUser) {
				return fail(400, { message: 'user with that email already exists' });
			}

			const passwordHash = await hash(password);

			try {
				const user_id = await create_user(email, { ph: passwordHash, e: email });
				const session = await auth.createSession(user_id as string);
				auth.setSessionTokenCookie(event, session);
			} catch (e) {
				console.error('register error: ', e);
				return fail(500, { message: 'there was an error on our side' });
			}
		} else {
			// Login path
			const existingUser = await getfirst<User>({ e: email });
			if (!existingUser) {
				return fail(400, { message: 'user does not exist' });
			}
			if (!existingUser.ph) {
				return fail(500);
			}

			const validPassword = await verify(existingUser.ph, password);
			if (!validPassword) {
				return fail(400, { message: 'Incorrect password' });
			}

			const session = await auth.createSession(existingUser.i as string);
			auth.setSessionTokenCookie(event, session);
		}

		return redirect(302, '/');
	}
};
