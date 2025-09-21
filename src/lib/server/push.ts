import { get, set } from '$lib/db';
import type { User } from '$lib/types';
import { send_push_notif } from '$lib/util/send_push_notif';
import type { PushSubscription } from 'web-push';

export async function sendPushToUserId(
	userId: string,
	userTag: string,
	chatId?: string
) {
	const ps = await get<User['ps']>(userId, 'ps');
	if (!ps) {
		return {
			ok: false as const,
			status: 404,
			reason: 'user not found'
		};
	}

	const list: PushSubscription[] = Array.isArray(ps)
		? (ps as PushSubscription[])
		: [ps as unknown as PushSubscription];

	// Prune expired before sending
	const now = Date.now();
	const nonExpired = list.filter((s) => {
		const exp = (s as unknown as { expirationTime?: number }).expirationTime;
		return !(typeof exp === 'number' && exp > 0 && exp < now);
	});
	if (nonExpired.length !== list.length) {
		await set(userId, { ps: nonExpired.length ? nonExpired : null });
	}

	if (nonExpired.length === 0) {
		return {
			ok: false as const,
			status: 404,
			reason: 'no subscriptions'
		};
	}

	const notificationPayload = {
		userTag,
		chatId
	};

	const results = await Promise.allSettled(
		nonExpired.map((subscription) =>
			send_push_notif(
				subscription,
				notificationPayload
			)
		)
	);

	// Prune gone/invalid subscriptions post-send
	const kept: PushSubscription[] = [];
	results.forEach((res, idx) => {
		if (res.status === 'fulfilled') {
			kept.push(nonExpired[idx]);
		} else {
			console.warn('push send failed; pruning subscription', res.reason);
		}
	});

	if (kept.length !== nonExpired.length) {
		await set(userId, { ps: kept.length ? kept : null });
	}

	return { ok: true as const };
}
