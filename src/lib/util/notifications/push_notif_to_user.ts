// Client-only helper: ask server to send a push to the user's stored subscription (user.ps)
export async function push_notif_to_user(
	userId: string,
	title: string,
	body: string,
	tag?: string
) {
	try {
		if (typeof window === 'undefined') return;
		await fetch(`/u/${userId}/push_notif`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				t: title,
				m: body,
				k: tag
			})
		});
	} catch (err) {
		console.error('push_notif_to_user error', err);
	}
}
