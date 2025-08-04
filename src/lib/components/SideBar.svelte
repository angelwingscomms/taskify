<script lang="ts">
	import { run, createBubbler, stopPropagation, handlers } from 'svelte/legacy';

	const bubble = createBubbler();
	import wolf from '$lib/images/wolf(circle).png';
	import homeIcon from '$lib/images/home-iconfont.svg';
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import { breakpoint, modalOpened, modalOverlay, mode, searchInput, showPD, sideBarOpen } from '$lib/stores';
	import { page } from '$app/state';
	import { i } from '$lib/i.svelte';
	let searchValue = $state('');
	function showProfileDB() {
		$showPD = !$showPD;
	}
	function clearSearchInput() {
		searchValue = '';
		$searchInput?.focus();
	}
	function openModal() {
		if ($breakpoint?.matches) {
			$modalOverlay = true;
			$modalOpened = !$modalOpened;
		}
	}
	
	run(() => {
		if ($searchInput) {
			if ($breakpoint?.matches) {
				$searchInput?.setAttribute('readonly', 'readonly');
			}
		}
	});

	let asideMid = $state();
	let scrolled = $state(false);

	function handleAsideScroll() {
		if (asideMid.scrollTop > 0) {
			scrolled = true;
		} else {
			scrolled = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (!$breakpoint?.matches) {
			e.ctrlKey && e.key === 'k' ? (e.preventDefault(), $searchInput?.focus()) : null;
		}
	}}
/>
<aside class:showAside={$sideBarOpen}>
	<div class="aside-top" class:asideScrolled={scrolled}>
		<div class="profile-overall">
			<button class="dropdown-activator" class:showPD={$showPD} onclick={showProfileDB}>
				<img class="avatar" src={page.data.user?.p} alt="user profile picture" />
				<span class="username">{page.data.user?.t}</span>
			</button>
			<ul class="profile-dropdown-body" class:showPD={$showPD}>
				<li>
					<a href="#">
						<i class="far fa-user"></i>
						Edit username
					</a>
				</li>
				<!-- <li>
					<a href="#">
						<i class="fas fa-lock"></i>
						Change password
					</a>
				</li>
				<li>
					<a href="#">
						<i class="far fa-image"></i>
						Change image
					</a>
				</li> -->
				<hr />
				<li>
					<a href="/logout">
						<i class="fas fa-arrow-right-from-bracket"></i>
						Log out
					</a>
				</li>
			</ul>
		</div>
		<div class="search-container" onclick={handlers(openModal, stopPropagation(bubble('click')))}>
			<i class="fas fa-search search-icon"></i>
			<input type="search" id="search-input" placeholder="Search" bind:value={searchValue} bind:this={$searchInput} />
			{#if !searchValue}
				<span aria-label="ctrlk">CTRL+K</span>
			{/if}
			{#if searchValue}
				<button onclick={handlers(stopPropagation(bubble('click')), clearSearchInput)}><i id="clear-search" class="fas fa-xmark"></i></button>
			{/if}
		</div>
	</div>
	<OverlayScrollbarsComponent style="flex: 1 0 0;" options={{ scrollbars: { autoHide: 'scroll' } }} defer>
		<div class="aside-middle" bind:this={asideMid} onscroll={handleAsideScroll}>
			<a onclick={() => i.mode = ''} href="#" class="menu-items" class:active={i.mode === ''}>
				<i class="fas fa-list-check"></i>
				<span class="menu-name">Tasks</span>
				<span class="list-amount">{i.tasks.length}</span>
			</a>
			<a onclick={() => i.mode = 'important'} href="#" class="menu-items" class:active={i.mode === 'important'}>
				<i class="far fa-flag"></i>
				<span class="menu-name">Important</span>
				<span class="list-amount">{i.tasks.filter(t => t.important).length}</span>
			</a>
			<a onclick={() => i.mode = 'completed'} href="#" class="menu-items" class:active={i.mode === 'completed'}>
				<i class="far fa-circle-check"></i>
				<span class="menu-name">Completed</span>
				<span class="list-amount">{i.tasks.filter(t => t.completed).length}</span>
			</a>
			<a onclick={() => i.mode = 'trash'} href="#" class="menu-items" class:active={i.mode === 'trash'}>
				<i class="far fa-trash-can"></i>
				<span class="menu-name">Trash</span>
				<span class="list-amount">{i.tasks.filter(t => t.deleted).length}</span>
			</a>
			<hr />
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">5</span>
			</a>
			<a href="#" class="menu-items">
				<i class="fas fa-bars"></i>
				<span class="menu-name">Grocery List</span>
				<span class="list-amount">100</span>
			</a>
		</div>
	</OverlayScrollbarsComponent>
	<div class="new-list-cont">
		<hr />
		<a href="#" class="menu-items new-list">
			<i class="fas fa-add"></i>
			<span class="menu-name">New List</span>
		</a>
	</div>
</aside>

<div class:modal-open={$modalOpened} class="modal"></div>

<style>
	.modal {
		width: 90%;
		height: 35rem;
		position: fixed;
		background-color: white;
		border-radius: 20px;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
		z-index: 283;
		inset: 0;
		margin: auto;
		transform: scale(1.1);
		opacity: 0;
		pointer-events: none;
		transition: 150ms;
	}
	.modal.modal-open {
		transform: scale(1);
		opacity: 1;
		pointer-events: all;
	}
</style>
