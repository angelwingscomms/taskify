<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<script lang="ts">
	import blankstate from '$lib/images/tasks-blankstate.png';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import { scrollContent } from '$lib/utilities/osScrollTop';
	import Task from '$lib/components/Task.svelte';
	import {
		searchInput,
		offlineTasks,
		breakpoint,
		sidebarOverlay,
		showPropSm,
		inputOverlay,
		taskInput
	} from '$lib/stores';
	import type { Task as _Task } from '$lib/types';
	import type { PageData } from './$types';
	import { PUBLIC_WORKER } from '$env/static/public';
	import { i } from '$lib/i.svelte.ts';

	// $offlineTasks = [];
	// let tasks: _Task[] = data.tasks;
	// // ? [...$page.data.tasks, ...$offlineTasks].sort((a, b) => b.date - a.date)
	// // : $offlineTasks.sort((a, b) => b.date - a.date);
	let name = $state('');
	let taskList: HTMLUListElement;
	let osTaskList: OverlayScrollbarsComponent;
	let websocket: WebSocket | undefined = undefined;

	$effect(() => {
		websocket = new WebSocket('ws' + PUBLIC_WORKER + '/' + 'tasks');

		websocket.onopen = () => {
			console.log('WebSocket connection opened.');
		};

		// Listen for messages
		websocket.onmessage = (event) => {
			console.log('event', event);
			let data = JSON.parse(event.data);
			let existing_task_index = i.tasks.findIndex((t) => t.i === data.i);
			console.log(existing_task_index);
			if (existing_task_index > -1) {
				i.tasks[existing_task_index] = data;
			} else {
				console.log('not exist');
				i.tasks = [...i.tasks, data];
			}
			console.log('s', i.tasks, tasks);
		};

		// Connection closed
		websocket.addEventListener('close', (event) => {
			console.log('WebSocket connection closed.', event.code, event.reason);
		});

		// Connection error
		websocket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
		});

		// return () => {
		// 	if (websocket) {
		// 		websocket.close();
		// 		websocket = undefined; // Clear the socket reference
		// 	}
		// };
	});

	let tasks = $derived.by(() => {
		return i.tasks.filter((t) => {
			switch (i.mode) {
				case 'important':
					return t.important === 1 && t.trash !== 1;
				case 'completed':
					return t.completed === 1 && t.trash !== 1;
				case 'trash':
					return t.trash === 1;
				default: // Covers mode === '' and any other cases
					return t.trash !== 1;
			}
		});
	});

	// Add a task
	async function addTask() {
		if (name === '') {
			alert('Please enter a task');
		} else {
			const task: _Task = {
				name,
				completed: 0,
				important: 0,
				trash: 0,
				date: Date.now() /*, id: 'offline-' + $nextOfflineId++  */
			};
			// i.tasks = [task, ...i.tasks];
			name = '';
			$taskInput?.focus();
			scrollContent(osTaskList);
			// $offlineTasks = [...$offlineTasks, task];
			try {
				task.i = (await axios.post('/', task)).data;
				// $offlineTasks = $offlineTasks.filter((t) => t.id !== task.id);
			} catch {}
		}
	}

	let firstSlash = true;
	onMount(() => {
		// !$breakpoint?.matches ? $taskInput?.focus() : null;
		$taskInput?.addEventListener('blur', () => {
			firstSlash = true;
		});
	});

	// Enable overlay on taskInput focus
	function taskInputOverlay() {
		$breakpoint?.matches ? ($inputOverlay = true) : null;
	}

	if (typeof window !== 'undefined') {
		$breakpoint = window.matchMedia('(max-width: 768px)');
	}

	// Delete a task
	async function del(i: string) {
		const taskToDelete = i.tasks.find((t) => t.i === i);
		if (!taskToDelete) {
			console.warn(`Attempted to delete non-existent task at index ${i}`);
			return;
		}

		// Optimistically remove the task from the UI
		tasks = i.tasks.filter((_, index) => index !== i);

		if (taskToDelete.id) {
			// If the task has an ID, it's a server-synced task. Attempt to delete from backend.
			try {
				// Send DELETE request to the server with the task ID in the request body
				await axios.delete('/', { data: { id: taskToDelete.id } });
			} catch (error) {
				console.error('Failed to delete task from server:', error);
				// If backend deletion fails, re-add the task to the UI and re-sort
				tasks = [...tasks, taskToDelete].sort((a, b) => b.date - a.date);
				alert('Failed to delete task from server. Please try again.');
			}
		} else {
			// If the task does not have an ID, it's an unsynced offline task.
			// It has already been removed from the `tasks` array.
			// Now, remove it from the `$offlineTasks` store as well.
			// This filters by object reference to ensure the exact pending task is removed.
			$offlineTasks.update((currentOfflineTasks) =>
				currentOfflineTasks.filter((offlineTask) => offlineTask !== taskToDelete)
			);
		}
	}

	// Function to toggle task properties panel
	let taskProp: HTMLDivElement;
	let showPropLg: boolean;
	function toggleTaskProp(e: Event) {
		if ($breakpoint?.matches) {
			// Small screen
			$showPropSm = true;
			$sidebarOverlay = true;
		} else {
			// Large screen
			showPropLg = !showPropLg;
		}
		e.stopPropagation();
	}

	/* MOBILE TASK PROP SWIPE FUNCTIONALITY */
	let startY: number | null = null;

	function handleTouchStart(e) {
		startY = e.touches[0].clientY;
	}

	function handleTouchMove(e) {
		if (!startY) return;

		let currentY = e.touches[0].clientY;
		let yDiff = startY - currentY;

		// Clamp the translateY to prevent pane from going too far up
		let translateY = Math.max(0, yDiff);
		taskProp.style.transform = `translateY(${translateY}px)`;
	}

	function handleTouchEnd(e) {
		if (!startY) return;

		let endY = e.changedTouches[0].clientY;
		let yDiff = startY - endY;

		if (yDiff > 50) {
			$showPropSm = false;
			$sidebarOverlay = false;
		}
		startY = null;
	}

	function closeTaskPropLg() {
		showPropLg = false;
	}
</script>

<svelte:head>
	<title>Taskify • Tasks</title>
</svelte:head>

<svelte:window
	on:keydown={(e) => {
		if (
			e.key.match(/^[a-zA-Z0-9\/]$/) &&
			document.activeElement !== $taskInput &&
			document.activeElement !== $searchInput
		) {
			$taskInput?.focus();
			if (e.key === '/' && firstSlash) {
				e.preventDefault();
				firstSlash = false;
			}
		}
		if (e.key === 'Escape') {
			showPropLg = false;
		}
	}}
	on:click={(e) => {
		// Close lg task properties on window click
		/* if (!$breakpoint?.matches && e.target instanceof Node && !taskProp?.contains(e.target)) {
			showPropLg = false;
		} */
	}}
/>

<div class="task-area-cont">
	<div class="task-header">
		<span class="material-symbols-rounded header-icon">checklist</span>
		<span class="header-span">Tasks</span>
	</div>

	<OverlayScrollbarsComponent bind:this={osTaskList} style="flex: 1 0 0;" defer>
		<ul class="task-list" bind:this={taskList}>
			{#each tasks as task, i (task.i)}
				<Task {task} {i} on:delete={() => del(i)} on:click={toggleTaskProp} />
			{/each}
		</ul>
	</OverlayScrollbarsComponent>

	{#if i.tasks.length === 0}
		<div class="blankslate">
			<img class="blankslate-top-img" src={blankstate} alt="" />
			<p>Tasks show up here if they aren't part of any lists</p>
		</div>
	{/if}

	<div id="add-task">
		<div>
			<i class="fas fa-add" id="add-icon"></i>
			<input
				on:keydown={(e) => {
					if (e.key === 'Enter') addTask();
				}}
				bind:value={name}
				type="text"
				id="task-input"
				class:showOverlay={$inputOverlay}
				placeholder="Add a task"
				bind:this={$taskInput}
				on:focus={taskInputOverlay}
			/>
			{#if !name}
				<span aria-label="/">/</span>
			{:else}
				<button on:click={addTask}><i class="fas fa-circle-arrow-up" id="upload-icon"></i></button>
			{/if}
		</div>
	</div>
</div>

<div class:showPropLg class:showPropSm={$showPropSm} class="task-properties" bind:this={taskProp}>
	<div
		class="puller"
		on:touchstart={handleTouchStart}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
	></div>
	<div>
		<button class="tpClose" on:click={closeTaskPropLg}><i class="fas fa-xmark"></i></button>
	</div>
	<OverlayScrollbarsComponent style="flex: 1 0 0;" defer>
		<div class="tpTop">
			<div class="taskName">Task Name</div>
			<div class="taskDesc">Description</div>
			<div class="addFile">Add file</div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	</OverlayScrollbarsComponent>
	<div class="tpFooter">Footer</div>
</div>
