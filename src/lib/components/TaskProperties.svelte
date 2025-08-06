<script lang="ts">
	import { i } from '$lib/i.svelte';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import Task from './Task.svelte';
	import axios from 'axios';
	import { v7 } from 'uuid';
	import { PUBLIC_WORKER } from '$env/static/public';
	import { toast } from '$lib/util/toast';

	let { show_prop_lg, ontouchstart, ontouchmove, ontouchend, closeTaskPropLg } = $props();

	let current_task_name = $state(''); // For editing i.current_task.n
	let current_task_description = $state(''); // For editing i.current_task.d
	let subtask_input_name = $state(''); // For adding new subtasks

	let websocket: WebSocket | undefined = undefined;

	// Debounce function
	function debounce(func, delay) {
		let timeout;
		return function (...args) {
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), delay);
		};
	}

	// Debounced function to edit the main task's properties
	const debounced_edit_task = debounce(async (field: 'n' | 'd', value: string) => {
		if (!i.current_task) return;
		const task_id = i.current_task.i;
		const original_value = i.current_task[field]; // Store original for revert on error

		try {
			// Optimistically update the current task in the store
			i.current_task = { ...i.current_task, [field]: value };
			await axios.put('/', { i: task_id, [field]: value });
			toast.success('Task updated.');
		} catch (error) {
			console.error('Failed to update task:', error);
			toast.error('Failed to update task.');
			// Revert to original value on error
			if (i.current_task && i.current_task.i === task_id) {
				i.current_task = { ...i.current_task, [field]: original_value };
				if (field === 'n') current_task_name = original_value;
				if (field === 'd') current_task_description = original_value;
			}
		}
	}, 2160); // 2.16 seconds

	// Effect to initialize local states when i.current_task changes
	$effect(() => {
		if (i.current_task) {
			current_task_name = i.current_task.n || '';
			current_task_description = i.current_task.d || '';
		} else {
			current_task_name = '';
			current_task_description = '';
		}
	});

	// Effects to watch local states and trigger debounced edit
	$effect(() => {
		// Only trigger if a task is selected and the value actually changed from the store
		// to prevent infinite loops if the store updates externally
		if (i.current_task && current_task_name !== i.current_task.n) {
			debounced_edit_task('n', current_task_name);
		}
	});

	$effect(() => {
		if (i.current_task && current_task_description !== i.current_task.d) {
			debounced_edit_task('d', current_task_description);
		}
	});

	// Add a subtask
	async function add() {
		if (!subtask_input_name.trim() || !i.current_task) {
			toast.error('Subtask name cannot be empty.');
			return;
		}

		const parent_task_id = i.current_task.i;
		const new_subtask = {
			n: subtask_input_name.trim(),
			i: v7(),
			p_i: parent_task_id, // Parent ID for subtasks
			o: true, // Optimistic update
			d: Date.now(),
			s: 't' // 't' for task, which includes subtasks
		};

		// Optimistically add to subtasks
		i.subtasks = [...(i.subtasks || []), new_subtask];
		subtask_input_name = ''; // Clear input

		// Send via WebSocket if available
		if (websocket) {
			websocket.send(JSON.stringify(new_subtask));
		}

		// Persist to server with retry logic
		const maxRetries = 9;
		const initialDelayMs = 500;
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				await axios.post('/', new_subtask);
				toast.success('Subtask added!');
				break; // Success, exit loop
			} catch (error) {
				console.error(`Attempt ${attempt + 1} of ${maxRetries + 1} to add subtask failed:`, error);
				if (attempt < maxRetries) {
					const delay = initialDelayMs * Math.pow(2, attempt);
					await new Promise((resolve) => setTimeout(resolve, delay));
				} else {
					toast.error('Failed to add subtask after multiple attempts. Please try again.');
					// Revert optimistic update if all retries fail
					i.subtasks = i.subtasks.filter((st) => st.i !== new_subtask.i);
				}
			}
		}
	}

	// Initialize websocket for subtasks (and general task updates)
	$effect(() => {
		websocket = new WebSocket('ws' + PUBLIC_WORKER + '/' + 'tasks'); // Using 'tasks' endpoint, assuming it handles subtasks too

		websocket.onopen = () => {
			console.log('TaskProperties WebSocket connection opened.');
		};

		websocket.onmessage = (event) => {
			let data = JSON.parse(event.data);
			// Check if the received data is a subtask for the current parent task
			if (i.current_task && data.p_i === i.current_task.i) {
				let existing_subtask_index = (i.subtasks || []).findIndex((st) => st.i === data.i);
				if (existing_subtask_index > -1) {
					const subtask = i.subtasks[existing_subtask_index];
					if (!data.o && subtask.o) delete subtask.o; // Remove optimistic flag if server confirms
					i.subtasks[existing_subtask_index] = { ...subtask, ...data };
				} else {
					// Add if not found
					i.subtasks = [...(i.subtasks || []), data];
				}
			}
		};

		websocket.addEventListener('close', (event) => {
			console.log('TaskProperties WebSocket connection closed.', event.code, event.reason);
		});

		websocket.addEventListener('error', (err) => {
			console.error('TaskProperties WebSocket error:', err);
		});

		// Cleanup function for $effect
		return () => {
			if (websocket) {
				websocket.close();
				websocket = undefined;
			}
		};
	});
</script>

{#if i.current_task}
	<div class:showPropLg={show_prop_lg} class:showPropSm={i.show_prop_sm} class="task-properties">
		<div class="puller" {ontouchstart} {ontouchmove} {ontouchend}></div>
		<div>
			<button class="tpClose" onclick={closeTaskPropLg}><i class="fas fa-xmark"></i></button>
		</div>
		<OverlayScrollbarsComponent style="flex: 1 0 0;" defer>
			<div class="tpTop">
				<input
					class="task-name-input"
					bind:value={current_task_name}
					placeholder="Task name"
					onkeydown={(e) => {
						// Prevent default Enter key behavior in a single-line input
						if (e.key === 'Enter') e.preventDefault();
					}}
				/>
				<label for="description-input">Description</label>
				<textarea
					id="description-input"
					class="task-description-input"
					bind:value={current_task_description}
					placeholder="Add a description..."
				></textarea>
			</div>

			<div class="subtasks-section">
				<h3>Subtasks</h3>
				{#await i.subtasks}
					<div class="loading-container">
						<i class="fas fa-spinner fa-spin fa-4x"></i>
					</div>
				{:then tasks}
					{#if tasks && tasks.length > 0}
						<ul class="task-list">
							{#each tasks as task, i (task.i)}
								<Task websocket={undefined} {task} onclick={() => {}} {i} />
							{/each}
						</ul>
					{:else}
						<div class="no-subtasks-message">
							<p>No subtasks yet. Add one below!</p>
						</div>
					{/if}
				{:catch}
					<div class="error-message">
						<i class="fas fa-exclamation-triangle fa-4x"></i>
						<p>Getting subtasks failed</p>
						<p>There was an error on our side.</p>
					</div>
				{/await}
			</div>

			<div id="add-subtask">
				<div>
					<input
						onkeydown={(e) => {
							if (e.key === 'Enter') add();
						}}
						onfocus={() => i.subtask_input = true}
						onblur={() => i.subtask_input = false}
						bind:value={subtask_input_name}
						type="text"
						id="subtask-input"
						placeholder="Add a subtask"
					/>
					{#if subtask_input_name}
						<!-- <span aria-label="/">/</span>
					{:else} -->
						<button onclick={add}><i class="fas fa-circle-arrow-up" id="upload-icon"></i></button>
					{/if}
				</div>
			</div>
		</OverlayScrollbarsComponent>
	</div>
{/if}

<style>
	/* M5: Styling */
	.task-properties {
		position: relative;
		flex-basis: 0;
		overflow-x: hidden;
		background-color: var(--clr-white);
		color: var(--clr-main);
		border-top-left-radius: 4px;
		display: flex;
		flex-direction: column;
	}

	.task-properties.showPropLg {
		flex-basis: 320px;
	}

	.task-properties.showPropSm {
		/* Inherited from parent Tasks.svelte */
	}

	.tpClose {
		width: 1.7rem;
		height: 1.7rem;
		font-size: 18px;
		line-height: 1.7rem;
		text-align: center;
		float: right;
		margin: 0.5rem 0.5rem 0.5rem 0;
		position: relative;
		cursor: pointer;
		z-index: 1;
	}
	.tpClose:hover::before {
		opacity: 1;
		transform: scale(1);
	}
	.tpClose::before {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		border-radius: 5px;
		background-color: lightgrey;
		z-index: -1;
		transform: scale(0.5);
		opacity: 0;
		transition: 70ms linear;
	}

	.puller {
		display: none; /* Only visible on mobile, handled by media query */
	}

	.tpTop {
		padding: 1rem 2rem;
		border-bottom: 1px solid var(--clr-grey-400); /* Separator */
	}

	.task-name-input {
		font-size: 26px; /* Similar to header-span in Tasks.svelte */
		font-weight: 500;
		border: none;
		outline: none;
		background: none;
		width: 100%;
		color: var(--clr-main);
		margin-bottom: 1rem;
		padding: 0;
	}
	.task-name-input::placeholder {
		color: var(--clr-placeholder);
	}

	.tpTop label {
		display: block;
		font-size: 14px;
		color: var(--clr-placeholder);
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		font-weight: 600;
	}

	.task-description-input {
		width: 100%;
		min-height: 80px; /* Make it a textarea */
		padding: 0.7rem 1rem;
		border: 1px solid var(--clr-grey-500);
		border-radius: 4px;
		font-size: 15px;
		color: var(--clr-main);
		background-color: var(--clr-grey-300);
		resize: vertical;
		outline: none;
		transition: border-color 150ms ease;
	}
	.task-description-input:focus {
		border-color: var(--clr-main);
	}
	.task-description-input::placeholder {
		color: var(--clr-placeholder);
	}

	.subtasks-section {
		flex: 1 0 0; /* Allow it to grow */
		padding: 1rem 2rem;
	}
	.subtasks-section h3 {
		font-size: 18px;
		margin-bottom: 1rem;
		color: var(--clr-main);
	}

	.loading-container,
	.error-message,
	.no-subtasks-message {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		text-align: center;
		color: var(--clr-placeholder); /* More subtle than error-color for no tasks */
		padding: 20px;
	}
	.error-message {
		color: var(--error-color, #dc3545);
	}
	.loading-container i,
	.error-message i {
		margin-bottom: 20px;
	}
	.no-subtasks-message p,
	.error-message p {
		font-size: 1.1em;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.task-list {
		list-style-type: none;
		padding: 0;
	}
	.task-list > li {
		margin-bottom: 0.25rem; /* Consistent with Tasks.svelte */
	}

	#add-subtask {
		padding: 0.7rem 2rem 1.5rem;
		color: var(--clr-white); /* Background is main color, so text is white */
		border-top: 1px solid var(--clr-grey-400); /* Separator */
	}
	#add-subtask > div {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 21.2px; /* Inner padding like add-task in Tasks.svelte */
		border-radius: 5px;
		overflow: hidden;
		background-color: var(--clr-main);
	}
	#subtask-input {
		background: transparent;
		width: 100%;
		border: none;
		outline: none;
		font-size: 1rem;
		flex-grow: 1;
		color: var(--clr-white);
		padding: 1rem 0;
		min-width: 0;
	}
	#subtask-input::placeholder {
		color: var(--clr-white);
	}
	#subtask-input:focus::placeholder {
		opacity: 0.5;
	}
	#add-subtask [aria-label=\'/\'] {
		background-color: var(--clr-main-dull);
		padding: 5px;
		border-radius: 3px;
	}
	#add-subtask button {
		background-color: transparent;
		border: none;
		padding: 0;
	}
	#add-subtask #upload-icon {
		font-size: 1.5rem;
		color: var(--clr-white);
		cursor: pointer;
		transition: 100ms;
		flex-shrink: 0;
	}
	#add-subtask #upload-icon:hover {
		color: hsl(0, 0%, 95%);
	}

	@media (max-width: 768px) {
		.task-properties {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 400px;
			z-index: 281;
			transform: translateY(100%);
			box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
			border-radius: 20px 20px 0 0;
			transition: 200ms;
		}

		.task-properties.showPropSm {
			transform: translateY(0);
		}

		.puller {
			display: block;
			width: 3em;
			height: 6px;
			background-color: var(--clr-grey-500);
			border-radius: 999px;
			margin: 10px auto;
		}

		.tpClose {
			display: none;
		}

		#add-subtask {
			padding: 0.5rem 1rem 1rem; /* Adjust padding for mobile */
		}
		#add-subtask > div {
			padding: 4px 21px; /* Adjust inner padding for mobile focus */
		}
		#subtask-input {
			padding: 0.9rem 0; /* Adjust input padding for mobile */
		}
		#add-subtask [aria-label=\'/\'] {
			display: none; /* Hide slash on mobile */
		}
	}
</style>
