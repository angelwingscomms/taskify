import { PUBLIC_WORKER } from '$env/static/public';
import { create } from '$lib/db';
import axios from 'axios';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, params }) => {
 const receivedString = await request.text();

 const data = {
  s: receivedString,
  u: locals.user?.i,
  d: Date.now()
 };

 await create(data, JSON.stringify({sender: locals.user.t, sent_at: data.d, message_text: receivedString}))

 await axios.post('http' + PUBLIC_WORKER + '/send/' + params.i, data)

 return new Response();
};