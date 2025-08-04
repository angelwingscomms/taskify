import { error } from '@sveltejs/kit';

export const internal_error = () => {
	error(500, 'there was an error on our side')
};
