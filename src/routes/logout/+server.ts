import { redirect, type RequestHandler } from '@sveltejs/kit';
import { invalidateSession, deleteSessionTokenCookie, sessionCookieName } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, locals }) => {
	// Get the session token from cookies
	const sessionToken = cookies.get(sessionCookieName);

	if (sessionToken && locals.session) {
		// Invalidate the session in the database
		await invalidateSession(locals.session.i);
	}

	// Delete the session cookie
	deleteSessionTokenCookie({ cookies, locals } as any);

	// Redirect to home page
	redirect(302, '/');
};
