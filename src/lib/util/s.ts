import { key } from './key';

export const s = async () => {
	const iv = crypto.getRandomValues(
		new Uint8Array(12)
	);
	const d = Date.now() + 30 * 1000 + '';

	const e = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		await key(),
		new TextEncoder().encode(d)
	);
	const sB64 = btoa(
		String.fromCharCode(...new Uint8Array(e))
	);
	const ivB64 = btoa(String.fromCharCode(...iv));
	return (
		'?s=' +
		encodeURIComponent(sB64) +
		'&iv=' +
		encodeURIComponent(ivB64)
	);
};
