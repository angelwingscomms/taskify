import { createSession, setSessionTokenCookie } from '$lib/server/auth';
import { decodeIdToken, Google } from 'arctic';

import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { create_user } from '$lib/auth';
import { search_by_payload } from '$lib/db';
import { internal_error } from '$lib/util/internal_error'
import type { User } from '$lib/types';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	// console.log('code:', code);
	// console.log('state:', state);
	// console.log('storedState:', storedState);
	// console.log('codeVerifier:', codeVerifier);
	if (code === null || state === null || storedState === null || codeVerifier === null) {
	error(500)
	}
	if (state !== storedState) {
	error(500)
	}

	let tokens: OAuth2Tokens;
	try {
	    const google = new Google(GOOGLE_ID, GOOGLE_SECRET, event.url.origin + '/google/callback')
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch {
		// Invalid code or client credentials
		console.error('Invalid code or client credentials');
		error(500)
	}
	const res = decodeIdToken(tokens.idToken()) as {
		sub: string;
		email: string;
    picture: string;
	};
	
	console.log('g user res', res)

	let user: User | null = null;

	const existingUsers = await search_by_payload<User>(
		{
			gid: res.sub,
			s: 'u'
		},
		1
	);

	console.log(existingUsers);

	if (existingUsers.length > 0) {
		// user = existingUsers[0];
		user = await create_user(res.email.replace('@gmail.com', ''), { gid: res.sub, p: res.picture });
	} else {
		user = await create_user(res.email.replace('@gmail.com', ''), { gid: res.sub, p: res.picture });
	}

	// Create new user

	if (!user) internal_error()

	const sessionToken = await createSession(user.i as string);

	setSessionTokenCookie(event, sessionToken);
	redirect(302, '/');
}
