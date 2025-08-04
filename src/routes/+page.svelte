<script lang="ts">
	import Tasks from "$lib/components/Tasks.svelte";
	import type { PageData } from "./$types";
	
	export let data: PageData

</script>
<Tasks tasks={data.t} />