import type { Message } from '$lib/types';
import { get_message_token_count } from '$lib/util/chat/token';

export const process_message = async <
	T extends Message
>(
	message: T
): Promise<T> => {
	const tc = await get_message_token_count({
		r: message.r,
		d: message.d,
		m: message.m
	});
	return { ...message, tc } as T;
};
