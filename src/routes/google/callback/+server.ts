import { createSession, google, setSessionTokenCookie } from '$lib/server/auth';
import { decodeIdToken } from 'arctic';

import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { create_user } from '$lib/auth';
import { searchByPayload } from '$lib/db';
import type { User } from '$lib/types';

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
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch {
		// Invalid code or client credentials
		console.error('Invalid code or client credentials');
		return new Response(null, {
			status: 400
		});
	}
	const res = decodeIdToken(tokens.idToken()) as {
		sub: string;
		email: string;
    picture: string;
	};
	
	console.log('g user res', res)

	let user: User | null = null;

	const existingUsers = await searchByPayload<User>(
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

	if (!user) return new Response(null, { status: 500 });

	const sessionToken = await createSession(user.i as string);

	setSessionTokenCookie(event, sessionToken);
	redirect(302, '/');
}
