import { VAPID_PRIVATE_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';
import webpush, {
	type PushSubscription
} from 'web-push';

webpush.setVapidDetails(
	'mailto:edge37@outlook.com',
	PUBLIC_VAPID_KEY,
	VAPID_PRIVATE_KEY
);

export const send_push_notif = async (
	subscription: PushSubscription,
	body: object
) => {
	const res = await webpush.sendNotification(
		subscription,
		JSON.stringify(body)
	);

	return res;
};
