<script lang="ts">
	import { run, createBubbler, self } from 'svelte/legacy';

	const bubble = createBubbler();
	import { breakpoint, taskDropdownOverlay } from '$lib/stores';
	import type { Task } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import MoreActions from './MoreActions.svelte';
	const dispatch = createEventDispatcher<{ delete: undefined }>();
	interface Props {
		task: Task;
		i: number;
	}

	let { task = $bindable(), i }: Props = $props();
	let hover = $state(false);
	let show_ma = false;
	function showMoreActions(e) {
		e.stopPropagation();
		show_ma = !show_ma;
		$taskDropdownOverlay = show_ma;
	}
	function toggleComplete() {
		task.completed = +!task.completed;
	}
	function toggleImportant() {
		task.important = +!task.important;
	}


	function mouseoverFunc() {
		hover = true;
	}
	function mouseoutFunc() {
		hover = false;
	}

	let taskname: HTMLSpanElement = $state();

	// Function to check for text wrapping and update styles
	let wrapSwitch: boolean = $state();
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

<li onclick={self(bubble('click'))}>
	<div>
		<button
			class="complete"
			onclick={(e) => {
				toggleComplete();
				e.stopPropagation();
			}}
			onmouseover={mouseover}
			onmouseout={mouseout}
		>
			<i class={task.completed ? 'fas fa-check-circle' : hover ? 'far fa-circle-check' : 'far fa-circle'}></i>
		</button>

		<span
			class:line-through={task.completed}
			class:fade-text={task.completed}
			onclick={self(bubble('click'))}
			id="taskName"
			bind:this={taskname}
			class:mgTop0={wrapSwitch}
		>
			{task.name}
		</span>

		<div class="button-cont">
			<button
				onclick={(e) => {
					toggleImportant();
					e.stopPropagation();
				}}
				class="task-buttons {i > 0 ? 'tooltip-top' : 'tooltip-left'}"
				data-tooltip="Flag as important"
			>
				<i class:fas={task.important} class="far fa-flag"></i>
			</button>
			<button
				onclick={(e) => {
					task.trash = +!task.trash;
					// dispatch('delete');
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
	<div class="extraInfo" class:mgTop7={wrapSwitch} class:fade-text={task.completed} onclick={self(bubble('click'))}><i class="far fa-calendar"></i> Today • 13:30</div>
</li>

<style>
	.line-through {
		text-decoration: line-through;
	}
	.fade-text {
		opacity: 0.6;
	}
</style>
