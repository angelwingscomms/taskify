<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<script lang="ts">
	import blankstate from '$lib/images/tasks-blankstate.png';
	import { onMount, tick } from 'svelte';
	import axios from 'axios';
	import { v7 } from 'uuid';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import { scrollContent } from '$lib/utilities/osScrollTop';
	import Task from '$lib/components/Task.svelte';
	import anime, { createDraggable } from 'animejs';
	import {
		searchInput,
		breakpoint,
		sidebarOverlay,
		showPropSm,
		inputOverlay,
		taskInput
	} from '$lib/stores';
	import type { Task as _Task, Mode } from '$lib/types';
	import { PUBLIC_WORKER } from '$env/static/public';
	import { i } from '$lib/i.svelte';
	import { modes } from '$lib/constants';

	let name = $state('');
	let taskList: HTMLUListElement;
	let osTaskList: OverlayScrollbarsComponent;
	let websocket: WebSocket | undefined = undefined;

	let { t }: { t: _Task[] } = $props();
	let task_height = $state(0);
	let top_zIndex = $state(1);
	// createDraggable('.')

	// $offlineTasks = [];
	i.tasks = t;
	i.p = Math.max(...i.tasks.map((task) => task.p), 0);
	// // ? [...$page.data.tasks, ...$offlineTasks].sort((a, b) => b.d - a.d)
	// // : $offlineTasks.sort((a, b) => b.d - a.d);

	$effect(() => console.log(task_height));

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
				const task = i.tasks[existing_task_index];
				if (!data.o && task.o) delete task.o;
				i.tasks[existing_task_index] = { ...task, ...data };
			} else {
				i.tasks = [...i.tasks, data];
			}
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

	// Add a task
	async function addTask() {
		if (name === '') {
			alert('Please enter a task');
		} else {
			const task: _Task = {
				n: name,
				i: v7(),
				o: true,
				p: i.p++,
				d: Date.now() /*, id: 'offline-' + $nextOfflineId++  */
			};
			i.tasks = [...i.tasks, task];
			name = '';
			if (websocket) websocket.send(JSON.stringify(task));
			$taskInput?.focus();
			scrollContent(osTaskList);

			const maxRetries = 9; // Number of retries after the initial attempt
			const initialDelayMs = 500; // Initial delay in milliseconds for retries
			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				try {
					await axios.post('/', task);
					break;
				} catch (error) {
					console.error(`Attempt ${attempt + 1} of ${maxRetries + 1} to add task failed:`, error);
					if (attempt < maxRetries) {
						// Calculate exponential backoff delay
						const delay = initialDelayMs * Math.pow(2, attempt);
						await new Promise((resolve) => setTimeout(resolve, delay));
					} else {
						// All retries exhausted, log the final failure.
						// Original code had an empty catch, so we won't rethrow.
						console.error(
							'All attempts to add task failed. Task may not be synchronized with the server.'
						);
					}
				}
			}
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
	async function del(id: string) {
		const taskToDelete = i.tasks.find((t) => t.i === id);
		if (!taskToDelete) {
			console.warn(`Attempted to delete non-existent task at index ${i}`);
			return;
		}

		// Optimistically remove the task from the UI
		// tasks = i.tasks.filter((_, index) => index !== i);

		if (taskToDelete.i) {
			try {
				await axios.delete('/?i=' + id);
			} catch (error) {
				console.error('Error deleting task:', error);
				alert('Failed to delete task.');
			}
		} else {
			// If the task does not have an ID, it's an unsynced offline task.
			// It has already been removed from the `tasks` array.
			// Now, remove it from the `$offlineTasks` store as well.
			// This filters by object reference to ensure the exact pending task is removed.
			// $offlineTasks.update((currentOfflineTasks) =>
			// 	currentOfflineTasks.filter((offlineTask) => offlineTask !== taskToDelete)
			// );
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
		// e.stopPropagation();
	}

	/* MOBILE TASK PROP SWIPE FUNCTIONALITY */
	let startY: number | null = null;

	function handleTouchStart(e) {
		startY = e.touches[0].clientY;
	}

	let elements: HTMLLIElement[] = $state([]);
	let drag_start_info: null | { i: string; p: number } = $state(null);

	onMount(() => {
		elements.forEach((el, index) => {
			anime.set(el, {
				top: index * task_height,
				left: 0,
				position: 'absolute'
			});
			createDraggable(el, {
				container: '.task-list',
				y: { snap: task_height },
				onGrab: (draggable) => {
					draggable.$target.classList.add('drag');
					draggable.$target.style.zIndex = String(top_zIndex++);
					const item = i[i.mode][index];
					drag_start_info = { i: item.i, p: item.p };
				},
				onRelease: async (draggable) => {
				if (!drag_start_info) return;
				// Capture drag_start_info in a new const after the null check
				const currentDragStartInfo = drag_start_info;

				console.log('drop', draggable.destY, task_height);
				let new_p = Math.max(
					0,
					Math.min(currentDragStartInfo.p + Math.round(Math.abs(draggable.destY) / task_height))
				);
				let positions_to_update: { i: string; p: number }[] = [];
				if (new_p === currentDragStartInfo.p) {
					anime({
						targets: draggable.$target,
						top: currentDragStartInfo.p * task_height,
						duration: 200,
						easing: 'easeOutQuint'
					});
				} else {
					i[i.mode].forEach((item) => {
						if (item.i === currentDragStartInfo.i) {
							item.p = new_p;
							positions_to_update.push({ i: item.i, p: item.p });
						} else {
							if (currentDragStartInfo.p < new_p && item.p >= new_p && item.p < currentDragStartInfo.p) {
								item.p--;
								positions_to_update.push({ i: item.i, p: item.p });
							} else if (
								currentDragStartInfo.p > new_p &&
								item.p >= new_p &&
								item.p < currentDragStartInfo.p
							) {
								item.p++;
								positions_to_update.push({ i: item.i, p: item.p });
							}
						}
					});

						for (let mode of ['a', 'x', 'c', 't'] as Mode[]) {
							i[mode].sort((a, b) => a.p - b.p);
						}

						await tick();

						anime({
							targets: elements,
							top: (el, i) => i * task_height,
							duration: 270,
							easing: 'easeOutQuint',
							complete: () => {
							if (!websocket) return;
							const ws = websocket; // Assign to a new const to help TypeScript with narrowing
							positions_to_update.forEach((p) => {
								ws.send(JSON.stringify(p));
								axios.put('/', p);
							});
							}
						});
						draggable.$target.classList.remove('drag');
						draggable.$target.style.zIndex = '1';
						drag_start_info = null;
					}
				}
			});
		});
	});

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
			e.key.match(/^[a-zA-Z0-9/]$/) &&
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
		<i class="{modes[i.mode].icon_classes} header-icon"></i>
		<span class="header-span">{modes[i.mode].text}</span>
	</div>

	<OverlayScrollbarsComponent bind:this={osTaskList} style="flex: 1 0 0;" defer>
		<ul class="task-list" bind:this={taskList}>
			{#each i[i.mode] as task, i (task.i)}
				<Task
					bind:height={task_height}
					bind:ref={elements[i]}
					{websocket}
					{task}
					{i}
					onclick={toggleTaskProp}
				/>
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
