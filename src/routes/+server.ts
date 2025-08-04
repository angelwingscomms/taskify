import type { RequestHandler } from './$types';
import { collection, task_tenant_id } from '$lib/constants';
import { v7 } from 'uuid';
import { client } from '$lib/utilities/qdrant';
import { embed } from '$lib/util/embed';
import { get, set } from '$lib/db';
import type { Task } from '$lib/types';
import axios from 'axios';
import { PUBLIC_WORKER } from '$env/static/public';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const data = await request.json();
		console.log('data', data);
		data.u = locals.user.i;
		data.s = task_tenant_id;
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
		await axios.post('http' + PUBLIC_WORKER + '/send/' + 'tasks', { ...data, i });
		return new Response(i);
	} catch (err) {
		console.error(err);
		return new Response('Error adding data to Qdrant', { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
	try {
		const i = url.searchParams.get('i');
		if (!i) {
			error(400, 'Missing task ID');
		}

		const task = await get<Task>(i);

		if (!task) {
			error(404, 'Task not found');
		}

		// Check ownership (u) and tenant scope (s)
		if (task?.u !== locals.user.i || task?.s !== task_tenant_id) {
			// Return 403 for unauthorized access, or 404 to avoid leaking information about existing IDs
			return new Response('Unauthorized', { status: 403 });
		}

		await set(i, { t: 1 });
		await axios.post('http' + PUBLIC_WORKER + '/send/' + 'tasks', { t: 1, i });

		return new Response('Task deleted successfully');
	} catch (err) {
		console.error(err);
		return new Response('Error deleting data from Qdrant', { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ locals, url, request }) => {
	try {
		const i = url.searchParams.get('i');
		const { field, value } = await request.json(); // Expecting field like 'c' or 'x', and its new value

		if (!i) {
			return new Response('Missing task ID', { status: 400 });
		}

		const task = await get<Task>(i);

		if (!task) {
			return new Response('Task not found', { status: 404 });
		}

		// Check ownership (u) and tenant scope (s)
		if (task?.u !== locals.user.i || task?.s !== task_tenant_id) {
			return new Response('Unauthorized', { status: 403 });
		}

		// Update the specific field
		await set(i, { [field]: value });

		// Send update to worker
		await axios.post('http' + PUBLIC_WORKER + '/send/' + 'tasks', { [field]: value, i });

		return new Response('Task updated successfully');
	} catch (err) {
		console.error(err);
		return new Response('Error updating data in Qdrant', { status: 500 });
	}
};
