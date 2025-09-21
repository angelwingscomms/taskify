import { create } from '$lib/db';
import type { User } from '$lib/types';
import { realtime } from '$lib/util/realtime';

export const create_user = async (
	tag: string,
	other: { p?: string; gid?: string }
) => {
	return await create<User>({
		s: 'u',
		t: tag,
		r: (
			await realtime.post('meetings', { title: tag })
		).data.data.id,
		d: '', // empty description initially
		a: 18, // default age
		g: 0, // default male
		l: 0, // default latitude
		n: 0, // default longitude
		w: '', // empty whatsapp link initially
		c: [], // empty color palette initially
		dc: Date.now(), // date created
		...other
	});
};
