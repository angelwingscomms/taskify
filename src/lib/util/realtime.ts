import axios from 'axios';
import { REALTIME_API_AUTH_HEADER } from '$env/static/private';

export const realtime = axios.create({
	baseURL: 'https://api.realtime.cloudflare.com/v2/',
	headers: {
		Authorization: `Basic ${REALTIME_API_AUTH_HEADER}`
	}
});
