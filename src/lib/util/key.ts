import { SECRET } from '$env/static/private';

export const key = async () => {
	// Ensure AES-GCM key length is valid (16, 24, or 32 bytes). Use SHA-256 to derive 32 bytes.
	const material = new TextEncoder().encode(
		SECRET ?? ''
	);
	const hash = await crypto.subtle.digest(
		'SHA-256',
		material
	);
	return await crypto.subtle.importKey(
		'raw',
		hash,
		{ name: 'AES-GCM' },
		false,
		['encrypt', 'decrypt']
	);
};
