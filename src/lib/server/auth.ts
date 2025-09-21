import { SECRET } from '$env/static/private';
import {
	get,
	delete_,
	create,
	edit_point,
	new_id
} from '$lib/db';
import type { User } from '$lib/types';
import type { RequestEvent } from '@sveltejs/kit';
import * as oslo_encoding from '@oslojs/encoding';

export const sessionCookieName = 'auth_session';
export const sessionJwtCookieName =
	'auth_session_jwt';

const SESSION_JWT_TTL_SECONDS = 24 * 60; // 24 minutes

export interface Session {
	s: 'se';
	u: string; // user id
	h: string; // hash (base64)
	c: number; // created at
	l: number; // last activity
	[key: string]: unknown; // Allow arbitrary keys for Qdrant payload compatibility
}

export interface SessionValidationResult {
	session: Session | null;
	user: User | null;
}

const ACTIVITY_CHECK_INTERVAL = 1440; // milliseconds
const INACTIVITY_TIMEOUT = 31536000 * 1000; // milliseconds (1 year)

export async function validateSessionToken(
	token: string
): Promise<SessionValidationResult> {
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
		const tokenSecretHash =
			await hashSecret(sessionSecret);
		// console.log(`[validateSessionToken] - Converting stored hash from Base64.`);
		const storedHash = base64ToUint8(session.h);
		// console.log(`[validateSessionToken] - Comparing hashes using constantTimeEqual.`);
		const isValid = constantTimeEqual(
			tokenSecretHash,
			storedHash
		);
		// console.log(`[validateSessionToken] - Session secret validation result: ${isValid}.`);

		if (!isValid) {
			// console.log(`[validateSessionToken] - Session secret is invalid for session ID: ${sessionId}. Returning null session/user.`);
			return { session: null, user: null };
		}
		// console.log(`[validateSessionToken] - Session secret is valid.`);

		// Update activity if enough time has passed
		const timeSinceLastActivityUpdate =
			now - session.l;
		// console.log(`[validateSessionToken] - Checking activity update interval. Time since last update: ${timeSinceLastActivityUpdate}ms. Check interval: ${ACTIVITY_CHECK_INTERVAL}ms.`);
		if (
			timeSinceLastActivityUpdate >=
			ACTIVITY_CHECK_INTERVAL
		) {
			// console.log(`[validateSessionToken] - Enough time has passed, updating session ${sessionId} last activity.`);
			session.l = now;
			// console.log(`[validateSessionToken] - Upserting session ${sessionId} to update last activity to ${session.l}.`);
			await edit_point(sessionId, session);
			// console.log(`[validateSessionToken] - Session ${sessionId} activity updated successfully.`);
		} else {
			// console.log(`[validateSessionToken] - Not enough time has passed to update session ${sessionId} activity.`);
		}

		// Get user
		// console.log(`[validateSessionToken] - Attempting to get user by ID: ${session.u}.`);
		const user = await get<User>(session.u, [
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
		return {
			session,
			user: { ...user, i: session.u }
		};
	} catch (error) {
		console.error(
			`[validateSessionToken] - Session validation error for session ID ${sessionId || 'unknown'}:`,
			error
		);
		return { session: null, user: null };
	}
}

export async function createSession(
	userId: string
): Promise<string> {
	const now = Date.now();
	const sessionId = new_id();
	const secret = generateSecureRandomString();
	const hash = await hashSecret(secret);
	const hashBase64 = uint8ToBase64(hash);

	const session: Session = {
		s: 'se',
		u: userId,
		h: hashBase64,
		c: now,
		l: now
	};

	await create(session, undefined, sessionId);
	return `${sessionId}.${secret}`;
}

export async function invalidateSession(
	sessionId: string
): Promise<void> {
	await delete_(sessionId);
}

export function setSessionTokenCookie(
	event: RequestEvent,
	token: string
): void {
	event.cookies.set(sessionCookieName, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: INACTIVITY_TIMEOUT / 1000 // Convert milliseconds to seconds
	});
}

export function setSessionJwtCookie(
	event: RequestEvent,
	jwt: string
): void {
	event.cookies.set(sessionJwtCookieName, jwt, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: SESSION_JWT_TTL_SECONDS
	});
}

export function deleteSessionTokenCookie(
	event: RequestEvent
): void {
	event.cookies.delete(sessionCookieName, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});
}

export function deleteSessionJwtCookie(
	event: RequestEvent
): void {
	event.cookies.delete(sessionJwtCookieName, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});
}

// Helper functions
function generateSecureRandomString(): string {
	const alphabet =
		'abcdefghijklmnpqrstuvwxyz23456789';
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

async function hashSecret(
	secret: string
): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(
		secret
	);
	const secretHashBuffer = await crypto.subtle.digest(
		'SHA-256',
		secretBytes
	);
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

function constantTimeEqual(
	a: Uint8Array,
	b: Uint8Array
): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}

// ===== Stateless JWT (HS256) =====

async function getJwtHS256Key(): Promise<CryptoKey> {
	// Derive a 32-byte key deterministically from an env secret
	const material = new TextEncoder().encode(
		SECRET ?? ''
	);
	const hash = await crypto.subtle.digest(
		'SHA-256',
		material
	);
	const keyBytes = new Uint8Array(hash); // 32 bytes
	return crypto.subtle.importKey(
		'raw',
		keyBytes,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

export interface ValidatedSession {
	id: string;
	createdAt: Date;
	issuedAt: Date;
	expiresAt: Date;
}

export async function createSessionJWTFromToken(
	token: string
): Promise<string> {
	const [sessionId] = token.split('.');
	if (!sessionId)
		throw new Error('Invalid session token');
	const session = await get<Session>(sessionId);
	if (!session) throw new Error('Session not found');
	return createSessionJWT({
		id: sessionId,
		createdAt: new Date(session.c)
	});
}

export async function createSessionJWT(session: {
	id: string;
	createdAt: Date;
}): Promise<string> {
	const now = new Date();
	const header = {
		alg: 'HS256',
		typ: 'JWT'
	} as const;
	const body = {
		session: {
			id: session.id,
			created_at: Math.floor(
				session.createdAt.getTime() / 1000
			)
		},
		iat: Math.floor(now.getTime() / 1000),
		exp:
			Math.floor(now.getTime() / 1000) +
			SESSION_JWT_TTL_SECONDS
	};

	const headerJSON = JSON.stringify(header);
	const bodyJSON = JSON.stringify(body);
	const encodedHeader = oslo_encoding.encodeBase64url(
		new TextEncoder().encode(headerJSON)
	);
	const encodedBody = oslo_encoding.encodeBase64url(
		new TextEncoder().encode(bodyJSON)
	);
	const headerAndBody = `${encodedHeader}.${encodedBody}`;
	const hmacKey = await getJwtHS256Key();
	const signature = await crypto.subtle.sign(
		'HMAC',
		hmacKey,
		new TextEncoder().encode(headerAndBody)
	);
	const encodedSignature =
		oslo_encoding.encodeBase64url(
			new Uint8Array(signature)
		);
	return `${headerAndBody}.${encodedSignature}`;
}

export async function validateSessionJWT(
	jwt: string
): Promise<ValidatedSession | null> {
	const now = Date.now();
	const parts = jwt.split('.');
	if (parts.length !== 3) return null;

	// Parse header
	let header;
	try {
		const headerJSON = new TextDecoder().decode(
			oslo_encoding.decodeBase64url(parts[0])
		);
		header = JSON.parse(headerJSON);
		if (typeof header !== 'object' || header === null)
			return null;
	} catch {
		return null;
	}
	if (
		(header.typ && header.typ !== 'JWT') ||
		header.alg !== 'HS256'
	)
		return null;

	// Verify signature
	let validSig = false;
	try {
		const hmacKey = await getJwtHS256Key();
		const signatureBytes =
			oslo_encoding.decodeBase64url(parts[2]);
		validSig = await crypto.subtle.verify(
			'HMAC',
			hmacKey,
			signatureBytes.buffer as unknown as ArrayBuffer,
			new TextEncoder().encode(
				parts[0] + '.' + parts[1]
			)
		);
	} catch {
		return null;
	}
	if (!validSig) return null;

	// Parse body
	let body;
	try {
		const bodyJSON = new TextDecoder().decode(
			oslo_encoding.decodeBase64url(parts[1])
		);
		body = JSON.parse(bodyJSON);
		if (typeof body !== 'object' || body === null)
			return null;
	} catch {
		return null;
	}

	if (typeof body.exp !== 'number') return null;
	if (now >= body.exp * 1000) return null;

	if (
		!body.session ||
		typeof body.session !== 'object'
	)
		return null;
	const s = body.session;
	if (
		typeof s.id !== 'string' ||
		typeof s.created_at !== 'number'
	)
		return null;

	const issuedAt =
		typeof body.iat === 'number'
			? new Date(body.iat * 1000)
			: new Date(0);
	const expiresAt = new Date(body.exp * 1000);
	return {
		id: s.id,
		createdAt: new Date(s.created_at * 1000),
		issuedAt,
		expiresAt
	};
}
