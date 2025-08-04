<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import 'overlayscrollbars/overlayscrollbars.css';
	import { sidebarOverlay, modalOpened, modalOverlay, showPropSm, sideBarOpen, inputOverlay, taskInput, showPD, taskDropdownOverlay, show_ma } from '$lib/stores';
	import { page } from '$app/state';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	
	function closeOverlays() {
		$sidebarOverlay = false;
		$taskDropdownOverlay = false;
		$inputOverlay = false;
		$showPropSm = false;
        $sideBarOpen = false;
		$taskInput?.blur();
		$showPD = false;
		$show_ma = false;
	};
	function closeModalOverlay() {
		$modalOverlay = false;
		$modalOpened = false;
	};
</script>

<div class:showOverlay={$taskDropdownOverlay} class="taskDropdownOverlay" onclick={closeOverlays}></div>
<div class:showOverlay={$sidebarOverlay} class="sidebarOverlay" onclick={closeOverlays}></div>
<div class:showOverlay={$inputOverlay} class="inputOverlay" onclick={closeOverlays}></div>
<div class:showOverlay={$modalOverlay} class="modalOverlay" onclick={closeModalOverlay}></div>
<div class="overall-container">
	<Header />
	<main>
	{#if !page.error}
		<SideBar />
	{/if}
		{@render children?.()}
	</main>
</div>
<div class="tooltip">Tooltip</div>
