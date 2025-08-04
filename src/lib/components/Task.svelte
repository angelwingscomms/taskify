<script lang="ts">
	import { run, createBubbler, self } from 'svelte/legacy';
	import axios from 'axios';

	const bubble = createBubbler();
	import { breakpoint, taskDropdownOverlay } from '$lib/stores';
	import type { Task } from '$lib/types';
	import MoreActions from './MoreActions.svelte';
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

	function mouseoverFunc() {
		hover = true;
	}
	function mouseoutFunc() {
		hover = false;
	}
	
	const format_date = (date: number) => {
	const today = new Date();
	const inputDate = new Date(date);

	// Normalize to midnight for accurate day comparison
	today.setHours(0, 0, 0, 0);
	inputDate.setHours(0, 0, 0, 0);

	const diffTime = inputDate.getTime() - today.getTime();
	const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return 'Today';
	} else if (diffDays === -1) {
		return 'Yesterday';
	} else {
		const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric
	}

	let taskname: HTMLSpanElement = $state();

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
		on:click|self
		id="taskName"
			bind:this={taskname}
			class:mgTop0={wrapSwitch}
		>
			{task.n}
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
					task.t = +!task.t;
					dispatch('delete');
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
	<div class="extraInfo" class:mgTop7={wrapSwitch} class:fade-text={task.c} onclick={self(bubble('click'))}><i class="far fa-calendar"></i> {format_date(task.d)}</div>
</li>

<style>
	.line-through {
		text-decoration: line-through;
	}
	.fade-text {
		opacity: 0.6;
	}
</style>
