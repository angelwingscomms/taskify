import { hash, verify } from 'argon2';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { find_user_by_tag } from '$lib/db';
import { create_user } from '$lib/auth';

export const load: PageServerLoad = async ({locals}) => {
	if (locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
		}


		const existingUser = await find_user_by_tag(username)
		// console.log('eu', existingUser)
		if (!existingUser) {
			return fail(400, { message: 'user does not exist' });
		}
		if (!existingUser.p) {
			return fail(500);
		}

		const validPassword = await verify(existingUser.p, password);
		if (!validPassword) {
			return fail(400, { message: 'Incorrect password' });
		}

		const session = await auth.createSession(existingUser.i as string);
		auth.setSessionTokenCookie(event, session);

		return redirect(302, '/');
	},
	
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		
		
		if (await find_user_by_tag(username as string)) {
		  return fail(400, {message: 'tag taken'})
		}

		// if (!validateUsername(username)) {
		// 	return fail(400, { message: 'Invalid username' });
		// }
		// if (!validatePassword(password)) {
		// 	return fail(400, { message: 'Invalid password' });
		// }
		// 
		// console.log('--login')

		const passwordHash = await hash(password);

		try {
			const user = await create_user(username, {p: passwordHash})
			// console.log('created user', user)

			// console.log('i--', user.i)
			const session = await auth.createSession(user.i as string);
			// console.log('s', session)
			auth.setSessionTokenCookie(event, session);
		} catch {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/');
	}
};

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
