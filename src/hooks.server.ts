import type { Handle } from '@sveltejs/kit';
import {
	validateSessionToken,
	sessionCookieName,
	setSessionTokenCookie,
	sessionJwtCookieName,
	setSessionJwtCookie,
	validateSessionJWT,
	createSessionJWT
} from '$lib/server/auth';

import { get as getDb } from '$lib/db';
import type { User } from '$lib/types';

type MinimalSession = {
	u: string;
	c: number;
	l: number;
	h: string;
	s: 'se';
};

export const handle: Handle = async ({
	event,
	resolve
}) => {
	const sessionToken = event.cookies.get(
		sessionCookieName
	);
	const sessionJWT = event.cookies.get(
		sessionJwtCookieName
	);

	// Try fast path: validate short-lived JWT
	if (sessionJWT) {
		const vs = await validateSessionJWT(sessionJWT);
		if (vs) {
			// Rolling JWT: re-issue only when nearing expiry (<= 5 minutes remaining)
			const msRemaining =
				vs.expiresAt.getTime() - Date.now();
			if (msRemaining <= 5 * 60 * 1000) {
				try {
					const newJwt = await createSessionJWT({
						id: vs.id,
						createdAt: vs.createdAt
					});
					setSessionJwtCookie(event, newJwt);
				} catch (e) {
					console.debug(
						'createSessionJWT error (rolling)',
						e
					);
				}
			} else {
				// Refresh cookie with the existing token to keep cookie alive until token expiry
				setSessionJwtCookie(event, sessionJWT);
			}
			if (sessionToken)
				setSessionTokenCookie(event, sessionToken);

			// Load user minimally
			if (vs.id) {
				const session = await getDb<MinimalSession>(
					vs.id
				);
				if (session) {
					const user = await getDb<User>(session.u, [
						't',
						'av',
						'd',
						'a',
						'g',
						'l',
						'n',
						'r',
						'rt'
					]);
					if (user) {
						event.locals.user = {
							i: session.u,
							t: user.t,
							d: user.d,
							av: user.av
						};
						event.locals.session = {
							...session,
							i: vs.id
						} as unknown as App.Locals['session'];
						return resolve(event);
					}
				}
			}
		}
	}

	// Fallback to DB-backed session token
	if (!sessionToken) {
		return resolve(event);
	}

	const { session, user } =
		await validateSessionToken(sessionToken);
	if (!user || !session) return resolve(event);

	// Refresh long-lived cookie and also mint a new short-lived JWT for next requests
	setSessionTokenCookie(event, sessionToken);

	// Presence: update user.on every ~60s
	try {
		const now = Date.now();
		const last =
			(event.locals.session as any)?.l ?? 0;
		if (now - last > 60_000) {
			const { set } = await import('$lib/db');
			await set(event.locals.user!.i, { on: now });
		}
	} catch {}

	try {
		const sessionId =
			sessionToken.split('.')[0] || '';
		const jwt = await createSessionJWT({
			id: sessionId,
			createdAt: new Date(session.c)
		});
		setSessionJwtCookie(event, jwt);
	} catch (e) {
		console.debug(
			'createSessionJWT error (fallback)',
			e
		);
	}

	event.locals.user = {
		i: session.u,
		t: user.t,
		d: user.d,
		av: user.av
	};
	event.locals.session =
		session as unknown as App.Locals['session'];
	return resolve(event);
};
