import { search_by_payload } from '$lib/db';
import { token_count } from '$lib/util/token_count';
import type { Message } from '$lib/types';

export const get_message_token_count = async (
	m: Pick<Message, 'r' | 'd' | 'm'>
): Promise<number> => {
	const last = (
		await search_by_payload<Pick<Message, 'tc'>>(
			{ s: 'm', r: m.r, d: { range: { lt: m.d } } },
			['tc'],
			1,
			{ key: 'd', direction: 'desc' }
		)
	)[0];
	const prev = (last as any)?.tc || 0;
	return prev + (await token_count(m.m));
};
