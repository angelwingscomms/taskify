<script lang="ts">
	import { outside_click } from '$lib/utilities/outside_click';
	let { task, websocket } = $props();
	let show_ma = $state(false);
	function showMoreActions(e) {
		e.stopPropagation();
		show_ma = !show_ma;
		// $taskDropdownOverlay = show_ma;
	}
</script>

<div use:outside_click onoutside_click={() => (show_ma = false)} class="more-actions">
	<button class:show_ma onclick={showMoreActions} class={task.i > 0 ? 'tooltip-top' : 'tooltip-left'} data-tooltip="More actions">
		<i class="fas fa-ellipsis-vertical"></i>
	</button>
	<ul class="more-actions-ul" class:show_ma>
		<li>
			<i class="far fa-circle-check"></i>
			Mark as completed
		</li>
		<li>
			<i class="fas fa-flag"></i>
			Flag as important
		</li>
		<li>
		<i class="far fa-copy"></i>
			Duplicate
		</li>
		<li>
			<i class="far fa-calendar"></i>
			Pick a date
		</li>
		<li onclick={() => websocket.send({__e: 'p', i: task.i, n: task.n})}>
		<i class="fas fa-thumbtack"></i>
			Pin
		</li>
		<li style="color: crimson">
			<i class="far fa-trash-can"></i>
			{task.p ? 'Permanently delete' : 'Delete task'}
		</li>
	</ul>
</div>
