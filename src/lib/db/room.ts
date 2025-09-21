import { qdrant } from './index';
import { get } from './index';
import type { User, Room } from '$lib/types';

export async function join_room(
	user_id: string,
	room_id: string
): Promise<void> {
	// Get current user data
	const user = await get<User>(user_id, ['r']); // get(id, [...desired payload fields])

	if (!user) {
		throw new Error('User not found');
	}

	// Update user rooms list
	const user_rooms = user.r || [];
	if (!user_rooms.includes(room_id)) {
		// Check if user has reached the room limit
		if (user_rooms.length >= 1440) {
			throw new Error(
				'User has reached the maximum number of rooms (1440)'
			);
		}

		user_rooms.push(room_id);
		await qdrant.setPayload('i', {
			wait: true,
			payload: { r: user_rooms },
			points: [user_id]
		});
	}
}

export async function leave_room(
	user_id: string,
	room_id: string
): Promise<void> {
	// Get current user data
	const user = await get<User>(user_id, ['r']); // get(id, [...desired payload fields])

	if (!user) {
		throw new Error('User not found');
	}

	// Remove room from user rooms list
	const user_rooms = (user.r || []).filter(
		(id) => id !== room_id
	);
	await qdrant.setPayload('i', {
		wait: true,
		payload: { r: user_rooms },
		points: [user_id]
	});
}
