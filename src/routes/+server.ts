import type { RequestHandler } from './$types';
import { collection, task_tenant_id } from '$lib/constants';
import { v7 } from 'uuid';
import { client } from '$lib/utilities/qdrant';
import { embed } from '$lib/util/embed';
import { get } from '$lib/db';
import type { Task } from '$lib/types';
import axios from 'axios';
import { PUBLIC_WORKER } from '$env/static/public';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const data = await request.json();
		console.log('data', data);
		data.u = locals.user.i;
		data.s = task_tenant_id;
		const i = v7();
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
		await axios.post('http' + PUBLIC_WORKER + '/send/' + 'tasks', {...data, i})
		return new Response(i);
	} catch (err) {
		console.error(err);
		return new Response('Error adding data to Qdrant', { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
	try {
		const id = url.searchParams.get('i');
		if (!id) {
			return new Response('Missing task ID', { status: 400 });
		}

		const task = await get<Task>(id)
		
		if (!task) {
			return new Response('Task not found', { status: 404 });
		}

		// Check ownership (u) and tenant scope (s)
		if (task?.u !== locals.user.i || task?.s !== task_tenant_id) {
			// Return 403 for unauthorized access, or 404 to avoid leaking information about existing IDs
			return new Response('Unauthorized', { status: 403 });
		}

		await client.delete(collection, {
			points: [id],
			wait: true
		});

		return new Response('Task deleted successfully');
	} catch (err) {
		console.error(err);
		return new Response('Error deleting data from Qdrant', { status: 500 });
	}
};
