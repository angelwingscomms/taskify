<script lang="ts">
	import { run, createBubbler, self } from 'svelte/legacy';
	import axios from 'axios';

	const bubble = createBubbler();
	import { breakpoint, taskDropdownOverlay } from '$lib/stores';
	import type { Task } from '$lib/types';
	import MoreActions from './MoreActions.svelte';
	import { date_format } from '$lib/util/date_format';
	interface Props {
		task: Task;
		i: number;
		onclick: (e: Event) => void;
		ondelete: (id: string) => Promise<void>;
	}

	let { task = $bindable(), i, onclick, ondelete }: Props = $props();
	let hover = $state(false);
	let show_ma = false;
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

	const toggle_property = (task: Task, property: keyof Task) => {
		if (!task.i) return;
		task[property] = +!task[property];
		axios.put('/?i=' + task.i, { [property]: task[property] });
	};

	let taskname: HTMLSpanElement | undefined = $state();

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
</script>

<li class:offline-task={task.o} onclick={self(bubble('click'))}>
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

		<div class="button-cont">
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
				data-tooltip="Move to trash"
			>
				<i class="far fa-trash-can"></i>
			</button>
			<MoreActions {i} />
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
