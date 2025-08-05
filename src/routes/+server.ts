import type { RequestHandler } from './$types';
import { collection, task_tenant_id } from '$lib/constants';
import { client } from '$lib/utilities/qdrant';
import { embed } from '$lib/util/embed';
import { get, search_by_vector, set } from '$lib/db';
import type { Task } from '$lib/types';
import { error, json } from '@sveltejs/kit';
import { internal_error } from '$lib/util/internal_error';

export const GET: RequestHandler = async ({ url, locals }) => {
	return json(await search_by_vector({ limit: 4, filter: {u: locals.user.i}, vector: await embed(url.searchParams.get('q') || '') }));
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const data = await request.json();
		console.log('data', data);
		data.u = locals.user.i;
		data.s = task_tenant_id;
		if (!data.i) error(400, 'missing i');
		const i = data.i;
		delete data.i;
		await client.upsert(collection, {
			wait: true,
			points: [
				{
					id: i,
					vector: await embed(JSON.stringify(data)),
					payload: data
				}
			]
		});
		// await axios.post('http' + PUBLIC_WORKER + '/send/' + 'tasks', { ...data, i });
		return new Response(i);
	} catch (err) {
		console.error(err);
		internal_error();
	}
};

export const PUT: RequestHandler = async ({ locals, request }) => {
	try {
		const data = await request.json(); // Expecting field like 'c' or 'x', and its new value
		console.log(data);

		if (data.i == null) {
			error(400, 'Missing task ID');
		}

		const i = data.i;
		delete data.i;

		const task = await get<Task>(i);

		if (!task) {
			error(404, 'Task not found');
		}

		// Check ownership (u) and tenant scope (s)
		if (task?.u !== locals.user.i || task?.s !== task_tenant_id) {
			error(403, 'Unauthorized');
		}

		// Update the specific field
		await set(i, data);

		// Send update to worker
		// await axios.post('http' + PUBLIC_WORKER + '/send/' + 'tasks', {...data, i});

		return new Response('Task updated successfully');
	} catch (err) {
		console.error(err);
		internal_error();
	}
};
