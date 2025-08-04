<!-- @migration-task Error while migrating Svelte code: `$showPropSm` is an illegal variable name. To reference a global variable called `$showPropSm`, use `globalThis.$showPropSm`
https://svelte.dev/e/global_reference_invalid -->
<div class:showPropLg class:showPropSm={$showPropSm} class="task-properties" bind:this={taskProp}>
	<div class="puller"
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