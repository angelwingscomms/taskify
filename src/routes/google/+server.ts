import { generateState, generateCodeVerifier, Google } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const google = new Google(GOOGLE_ID, GOOGLE_SECRET, event.url.origin + '/google/callback');
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 432000 * 90,
		sameSite: 'lax'
	});
	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 432000 * 90,
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
