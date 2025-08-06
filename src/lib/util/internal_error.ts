import { error } from '@sveltejs/kit';

export const internal_error = (m?: string) => {
	throw error(500, 'there was an error on our side' + m ? `: ${m}` : '');
};
