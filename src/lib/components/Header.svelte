<script lang="ts">
	import logo from '$lib/images/check-logo(white).png';
	import { sidebarOverlay, sideBarOpen } from '$lib/stores';
	function toggleAside() {
		$sideBarOpen = !$sideBarOpen;
		$sidebarOverlay = true;
	}
	let themeToggled:boolean = $state();
	function toggleTheme() {
		themeToggled = !themeToggled;
	}
</script>

<header>
	<button onclick={toggleAside} class="bars-cont"><i class="fas fa-fw fa-bars"></i></button>
	<div id="brand">
		<img src={logo} alt="check-logo" width="17" />
		<span>Taskify</span>
	</div>
	<span class:theme-rotate={themeToggled} class="material-symbols-rounded theme-toggle" onclick={toggleTheme}>{themeToggled ? 'light_mode' : 'dark_mode'}</span>
</header>
