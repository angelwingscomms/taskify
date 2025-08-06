<script lang="ts">
	import { run, createBubbler, self } from 'svelte/legacy';
	import axios from 'axios';

	const bubble = createBubbler();
	import { breakpoint, taskDropdownOverlay } from '$lib/stores';
	import type { Mode, Task } from '$lib/types';
	import MoreActions from './MoreActions.svelte';
	import { date_format } from '$lib/util/date_format';
	interface Props {
		task: Task;
		i: number;
		height?: number;
		ref?: HTMLLIElement;
		websocket: WebSocket | undefined;
		onclick: (e: Event) => void;
	}

	let {
		task = $bindable(),
		websocket,
		ref = $bindable(),
		height = $bindable(),
		i,
		onclick
	}: Props = $props();
	let hover = $state(false);
	// let show_ma = false;
	// function showMoreActions(e) {
	// 	e.stopPropagation();
	// 	show_ma = !show_ma;
	// 	$taskDropdownOverlay = show_ma;
	// }

	function mouseoverFunc() {
		hover = true;
	}
	function mouseoutFunc() {
		hover = false;
	}

	const toggle_property = (task: Task, property: Omit<Mode, 'a'>) => {
		task[property] = +!task[property];
		if (!task.i || !websocket) return;
		let data = { [property]: task[property], i: task.i };
		websocket.send(JSON.stringify(data));
		axios.put('/', data);
	};

	let taskname: HTMLSpanElement | undefined = $state();
	let editing = $state(false);

	// Function to check for text wrapping and update styles
	let wrapSwitch: boolean = $state(false);
	function checkTextWrap() {
		const height = parseFloat(window.getComputedStyle(taskname).height);
		if (height > 28) {
			wrapSwitch = true;
		} else {
			wrapSwitch = false;
		}
	}
	// Remove complete button hover effect on small screens
	let mouseover = $derived($breakpoint?.matches ? null : mouseoverFunc);
	let mouseout = $derived($breakpoint?.matches ? null : mouseoutFunc);
	run(() => {
		if (taskname) {
			checkTextWrap();
		}
	});

	const get_height = (node: HTMLElement) => {
		const update = () => {
			height = node.clientHeight + parseFloat(getComputedStyle(node).marginBottom);
		};

		update(); // Initial measure

		// const resizeObserver = new ResizeObserver(update);
		// resizeObserver.observe(node);

		// const observer = new MutationObserver(update);
		// observer.observe(node, { attributes: true, attributeFilter: ['style', 'class'] });

		return {
			destroy() {
				// resizeObserver.disconnect();
				// observer.disconnect();
			}
		};
	};
</script>

<li
	bind:this={ref}
	class="drag-task"
	use:get_height
	class:offline-task={task.o}
	onclick={onclick}
>
	<div>
		<button
			class="complete"
			onclick={(e) => {
				toggle_property(task, 'c');
				e.stopPropagation();
			}}
			onmouseover={mouseover}
			onmouseout={mouseout}
		>
			<i class={task.c ? 'fas fa-check-circle' : hover ? 'far fa-circle-check' : 'far fa-circle'}
			></i>
		</button>

		{#if editing}
			<input
				type="text"
				bind:value={task.n}
				onblur={() => {
					editing = false;
					if (task.i && websocket) {
						let data = { n: task.n, i: task.i };
						websocket.send(JSON.stringify(data));
						axios.put('/', data);
					}
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						editing = false;
						if (task.i && websocket) {
							let data = { n: task.n, i: task.i };
							websocket.send(JSON.stringify(data));
							axios.put('/', data);
						}
					}
				}}
				class="task-name-input"
				class:line-through={task.c}
				class:fade-text={task.c}
			/>
		{:else}
			<span
				class:line-through={task.c}
				class:fade-text={task.c}
				onclick={(event) => {
					if (event.target === event.currentTarget) onclick();
				}}
				id="taskName"
				bind:this={taskname}
				class:mgTop0={wrapSwitch}
			>
				{task.n}
			</span>
		{/if}
		<div class="button-cont">
			<button
				onclick={() => (editing = !editing)}
				class="task-buttons {i > 0 ? 'tooltip-top' : 'tooltip-left'}"
				data-tooltip="Flag as important"
			>
				<i class={editing ? 'fas fa-check' : 'far fa-pen-to-square'}></i>
			</button>
			<button
				onclick={(e) => {
					toggle_property(task, 'x');
					e.stopPropagation();
				}}
				class="task-buttons {i > 0 ? 'tooltip-top' : 'tooltip-left'}"
				data-tooltip="Flag as important"
			>
				<i class:fas={task.x} class="far fa-flag"></i>
			</button>
			<button
				onclick={(e) => {
					toggle_property(task, 't');
					e.stopPropagation();
				}}
				class="task-buttons {i > 0 ? 'tooltip-top' : 'tooltip-left'}"
				data-tooltip={task.t ? "Restore" : "Move to trash"}
			>
				<i class={task.t ? "fas fa-trash-arrow-up" :"far fa-trash-can"}></i>
			</button>
			<MoreActions p={task.t} {i} />
		</div>
	</div>
	<div
		class="extraInfo"
		class:mgTop7={wrapSwitch}
		class:fade-text={task.c}
		onclick={self(bubble('click'))}
	>
		<i class="far fa-calendar"></i>
		{date_format(task.d)}
	</div>
</li>

<style>
	.line-through {
		text-decoration: line-through;
	}
	.fade-text {
		opacity: 0.6;
	}
</style>
