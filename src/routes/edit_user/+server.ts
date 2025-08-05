import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { update_point } from '$lib/db';

export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401)
  const data = await request.json()
  await update_point(locals.user.i, data)
  return new Response()
};
