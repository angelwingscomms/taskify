import { deleteById, searchByPayload } from '$lib/db';
import type { User } from '$lib/types';

export const delete_all_users = async () => {
	const allUsersToDelete = await searchByPayload<User>({ s: 'u' }, 1_000_000); // Fetch up to 1 million users
	console.log(`Found ${allUsersToDelete.length} users to delete.`);
	for (const userToDelete of allUsersToDelete) {
		console.log(`Deleting user ID: ${userToDelete.i}`);
		if (!userToDelete.i) continue;
		await deleteById(userToDelete.i);
	}
	console.log('All users deleted.');
};
