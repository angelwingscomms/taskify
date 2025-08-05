<script lang="ts">
	import SideBar from "$lib/components/SideBar.svelte";
	import Tasks from "$lib/components/Tasks.svelte";
	import type { PageData } from "./$types";
	
	export let data: PageData

</script>
<SideBar />
<Tasks t={data.t} />