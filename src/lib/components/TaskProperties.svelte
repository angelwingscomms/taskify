<script>
	import { i } from '$lib/i.svelte';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	let { show_prop_lg, ontouchstart, ontouchmove, ontouchend, closeTaskPropLg } = $props();
</script>

<div class:showPropLg={show_prop_lg} class:showPropSm={i.show_prop_sm} class="task-properties">
	<div class="puller" {ontouchstart} {ontouchmove} {ontouchend}></div>
	<div>
		<button class="tpClose" onclick={closeTaskPropLg}><i class="fas fa-xmark"></i></button>
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
