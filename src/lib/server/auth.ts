import { Google } from 'arctic';
import { GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL } from '$env/static/private';
import { get, search_by_payload, edit_point } from '$lib/db';
import type { User } from '$lib/types';
import { v7 } from 'uuid';
import type { RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export const sessionCookieName = 'auth_session';

interface Session {
	s: 'se';
	i: string; // session id
	u: string; // user id
	h: string; // hash (base64)
	c: number; // created at
	l: number; // last activity
	expiresAt: Date;
}

export interface SessionValidationResult {
	session: Session | null;
	user: User | null;
}

const ACTIVITY_CHECK_INTERVAL = 1440; // milliseconds
const INACTIVITY_TIMEOUT = 777600 * 1000; // milliseconds

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	// console.log('[validateSessionToken] - Function started.');
	// console.log(`[validateSessionToken] - Received token: ${token ? 'present' : 'null/undefined'}`);

	const now = Date.now();
	const tokenParts = token.split('.');
	// console.log(`[validateSessionToken] - Token parts: ${tokenParts.length} parts found.`);

	if (tokenParts.length !== 2) {
		// console.log(`[validateSessionToken] - Token parts length is not 2. Found: ${tokenParts.length}. Returning null session/user.`);
		return { session: null, user: null };
	}

	const [sessionId, sessionSecret] = tokenParts;
	// console.log(`[validateSessionToken] - Extracted sessionId: ${sessionId}, sessionSecret: ${sessionSecret ? 'present' : 'null/undefined'}.`);

	try {
		// console.log(`[validateSessionToken] - Attempting to get session by ID: ${sessionId}.`);
		const session = await get<Session>(sessionId);
		// console.log(`[validateSessionToken] - Session retrieved: ${session ? 'found' : 'not found'}.`);

		if (!session) {
			// console.log(`[validateSessionToken] - No session found for ID: ${sessionId}. Returning null session/user.`);
			return { session: null, user: null };
		}
		// console.log(`[validateSessionToken] - Session details (partial): id=${session.i}, userId=${session.u}, lastActivity=${session.l}, createdAt=${session.c}`);

		// Check if session expired
		const inactivityDuration = now - session.l;
		// console.log(`[validateSessionToken] - Checking session expiry. Current inactivity: ${inactivityDuration}ms. Timeout: ${INACTIVITY_TIMEOUT}ms.`);
		if (inactivityDuration >= INACTIVITY_TIMEOUT) {
			// console.log(`[validateSessionToken] - Session ${sessionId} has expired due to inactivity. Deleting session.`);
			await delete_(sessionId);
			// console.log(`[validateSessionToken] - Session ${sessionId} deleted. Returning null session/user.`);
			return { session: null, user: null };
		}
		// console.log(`[validateSessionToken] - Session ${sessionId} is not expired.`);

		// Verify session secret
		// console.log(`[validateSessionToken] - Hashing provided session secret.`);
		const tokenSecretHash = await hashSecret(sessionSecret);
		// console.log(`[validateSessionToken] - Converting stored hash from Base64.`);
		const storedHash = base64ToUint8(session.h);
		// console.log(`[validateSessionToken] - Comparing hashes using constantTimeEqual.`);
		const isValid = constantTimeEqual(tokenSecretHash, storedHash);
		// console.log(`[validateSessionToken] - Session secret validation result: ${isValid}.`);

		if (!isValid) {
			// console.log(`[validateSessionToken] - Session secret is invalid for session ID: ${sessionId}. Returning null session/user.`);
			return { session: null, user: null };
		}
		// console.log(`[validateSessionToken] - Session secret is valid.`);

		// Update activity if enough time has passed
		const timeSinceLastActivityUpdate = now - session.l;
		// console.log(`[validateSessionToken] - Checking activity update interval. Time since last update: ${timeSinceLastActivityUpdate}ms. Check interval: ${ACTIVITY_CHECK_INTERVAL}ms.`);
		if (timeSinceLastActivityUpdate >= ACTIVITY_CHECK_INTERVAL) {
			// console.log(`[validateSessionToken] - Enough time has passed, updating session ${sessionId} last activity.`);
			session.l = now;
			// console.log(`[validateSessionToken] - Upserting session ${sessionId} to update last activity to ${session.l}.`);
			await edit_point(session);
			// console.log(`[validateSessionToken] - Session ${sessionId} activity updated successfully.`);
		} else {
			// console.log(`[validateSessionToken] - Not enough time has passed to update session ${sessionId} activity.`);
		}

		// Get user
		// console.log(`[validateSessionToken] - Attempting to get user by ID: ${session.u}.`);
		const user = await get<User>(session.u);
		// console.log('session--', session)
		// console.log(`[validateSessionToken] - User retrieved: ${user ? 'found' : 'not found'}.`);
		if (!user) {
			// console.log(`[validateSessionToken] - No user found for user ID: ${session.u} linked to session ${sessionId}. Deleting session.`);
			await delete_(sessionId);
			// console.log(`[validateSessionToken] - Session ${sessionId} deleted. Returning null session/user.`);
			return { session: null, user: null };
		}
		// console.log(`[validateSessionToken] - User found: ${user.t} (tag).`);

		// console.log(`[validateSessionToken] - Session and user successfully validated. Returning results.`);
		return { session, user: { ...user, i: session.u } };
	} catch (error) {
		console.error(
			`[validateSessionToken] - Session validation error for session ID ${sessionId || 'unknown'}:`,
			error
		);
		return { session: null, user: null };
	}
}

export async function createSession(userId: string): Promise<string> {
	const now = Date.now();
	const sessionId = v7();
	const secret = generateSecureRandomString();
	const hash = await hashSecret(secret);
	const hashBase64 = uint8ToBase64(hash);

	const session: Session = {
		s: 'se',
		i: sessionId,
		u: userId,
		h: hashBase64,
		c: now,
		l: now,
		expiresAt: new Date(now + INACTIVITY_TIMEOUT)
	};

	await edit_point(session);
	return `${sessionId}.${secret}`;
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await delete_(sessionId);
}

export function setSessionTokenCookie(event: RequestEvent, token: string): void {
	event.cookies.set(sessionCookieName, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
		// expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.delete(sessionCookieName, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});
}

// Helper functions
function generateSecureRandomString(): string {
	const alphabet = 'abcdefghijklmnpqrstuvwxyz23456789';
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
}

function uint8ToBase64(arr: Uint8Array): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(arr).toString('base64');
	}
	return btoa(String.fromCharCode(...arr));
}

function base64ToUint8(str: string): Uint8Array {
	if (typeof Buffer !== 'undefined') {
		return new Uint8Array(Buffer.from(str, 'base64'));
	}
	const binary = atob(str);
	const arr = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		arr[i] = binary.charCodeAt(i);
	}
	return arr;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}

const SALT_ROUNDS = 10;

export async function hash_password(password: string): Promise<string> {
	return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verify_password(password: string, hash: string): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}
