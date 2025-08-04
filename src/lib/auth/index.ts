import { delete_, get, searchByPayload, upsertPoint } from '$lib/db';
import type { User } from '$lib/types';

export { create_user } from './create_user';

import { Google } from 'arctic';
import { GOOGLE_ID, GOOGLE_REDIRECT_URL, GOOGLE_SECRET } from '$env/static/private';
import { v7 } from 'uuid';

export const google = new Google(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL);

export async function requireAuth(locals: App.Locals) {
	if (!locals.user) {
		return {
			n: '',
			i: '',
			id: ''
		};
		// redirect(303, '/auth');
	} else {
		return locals.user;
	}
}

function generateSecureRandomString(): string {
	// Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
	const alphabet = 'abcdefghijklmnpqrstuvwxyz23456789';

	// Generate 24 bytes = 192 bits of entropy.
	// We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		// >> 3 s"removes" the right-most 3 bits of the byte
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

function uint8ToBase64(arr: Uint8Array): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(arr).toString('base64');
	}
	// Browser fallback
	return btoa(String.fromCharCode(...arr));
}

function base64ToUint8(str: string): Uint8Array {
	if (typeof Buffer !== 'undefined') {
		return new Uint8Array(Buffer.from(str, 'base64'));
	}
	// Browser fallback
	const binary = atob(str);
	const arr = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		arr[i] = binary.charCodeAt(i);
	}
	return arr;
}

export const createSession = async (u: string): Promise<SessionWithToken> => {
	const now = Date.now();

	const i = v7();
	const secret = generateSecureRandomString();
	const h = await hashSecret(secret);
	const h_b64 = uint8ToBase64(h);

	const session: SessionWithToken = {
		i,
		u,
		h: h_b64,
		c: now,
		l: now,
		s: 'se',
		t: i + '.' + secret
	};

	await upsertPoint(session);

	return session;
};

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
}

export interface SessionWithToken extends Session {
	t: string;
}

interface Session {
	s: string;
	i: string;
	u: string;
	h: string; // base64 encoded hash
	c: number;
	l: number;
}

const activityCheckInterval = 1440;
const inactivityTimeoutSeconds = 777600;

export async function validateSessionToken(token: string): Promise<Session | null> {
	const now = Date.now();
	const tokenParts = token.split('.');
	if (tokenParts.length !== 2) return null;
	const [sessionId, sessionSecret] = tokenParts;
	const session = await getSession(sessionId);
	if (!session) return null;

	const tokenSecretHash = await hashSecret(sessionSecret);
	if (typeof session.h !== 'string') return null;
	const storedHash = base64ToUint8(session.h);
	const equal = constantTimeEqual(tokenSecretHash, storedHash);
	if (!equal) return null;
	// Activity check: update lastVerifiedAt if enough time has passed
	if (now - session.l >= activityCheckInterval) {
		session.l = now;
		await upsertPoint(session);
	}

	return session;
}

export async function getSession(sessionId: string): Promise<Session | null> {
	const now = Date.now();
	const session = await get<Session>(sessionId);

	if (!session) {
		console.error('Session not found:', sessionId);
		return null;
	}

	// Inactivity timeout
	if (now - session.l >= inactivityTimeoutSeconds * 1000) {
		await delete_(sessionId);
		return null;
	}

	return session;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}
