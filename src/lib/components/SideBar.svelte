<script lang="ts">
	import { run, createBubbler, stopPropagation, handlers } from 'svelte/legacy';

	const bubble = createBubbler();
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
	import {
		breakpoint,
		modalOpened,
		modalOverlay,
		searchInput,
		showPD,
		sideBarOpen
	} from '$lib/stores';
	import { page } from '$app/state';
	import { modes } from '$lib/constants';
	import { i } from '$lib/i.svelte';
	import axios from 'axios';
	import ChangePasswordModal from './change_password_modal.svelte';
	import DeleteAccountModal from './delete_account_modal.svelte';
	import { type Task } from '$lib/types';

	function showProfileDB() {
		$showPD = !$showPD;
	}

	let username_val = $state(page.data.user?.t || '');
	let username_edit_loading = $state(false);

	function enable_username_edit(e) {
		$showPD = false;
		i.editing_username = true;
		username_val = page.data.user?.t;
	}

	const submit_username = async () => {
		username_edit_loading = true;
		try {
			const res = await axios.put('/edit_user', { t: username_val });
			console.log(res);
			page.data.user.t = username_val;
		} catch (err) {
			console.log(err);
			alert('an error occured on our side');
		} finally {
			i.editing_username = false;
			username_edit_loading = false;
		}
	};

	function cancel_username() {
		i.editing_username = false;
	}

	function handle_username_keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			submit_username();
		} else if (e.key === 'Escape') {
			cancel_username();
		}
	}
	function clearSearchInput() {
		i.search = '';
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
<DeleteAccountModal />
<ChangePasswordModal />
<aside class:showAside={$sideBarOpen}>
	<div class="aside-top" class:asideScrolled={scrolled}>
		<div class="profile-overall">
			<button class="dropdown-activator" class:showPD={$showPD} onclick={showProfileDB}>
				{#if page.data.user?.p}
					<img class="avatar" src={page.data.user?.p} alt="user profile picture" />
				{:else}
					<i class="far fa-user"></i>
				{/if}
				{#if i.editing_username}
					<input
						class="username-edit"
						bind:value={username_val}
						onkeydown={handle_username_keydown}
					/>
					<button onclick={submit_username} class="submit-username">
						{#if username_edit_loading}
							<i class="fas fa-spinner fa-spin"></i>
						{:else}
							<i class="fas fa-check"></i>
						{/if}
					</button>
					<button onclick={cancel_username}><i class="fas fa-times"></i></button>
				{:else}
					<span class="username">{page.data.user?.t}</span>
				{/if}
			</button>
			<ul class="profile-dropdown-body" class:showPD={$showPD}>
				<li>
					<a
						href="#"
						onclick={(e) => {
							e.preventDefault();
							enable_username_edit(e);
						}}
					>
						<i class="far fa-user"></i>
						Edit username
					</a>
				</li>
				<li>
					<a onclick={() => (i.change_password_open = true)} href="#">
						<i class="fas fa-lock"></i>
						Change password
					</a>
				</li>
				<li>
					<a href="#">
						<i class="far fa-image"></i>
						Change image
					</a>
				</li>

				<li>
					<a onclick={() => (i.delete_account_open = true)} href="#">
						<i class="fas fa-trash-can"></i>
						Delete account
					</a>
				</li>
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
			<input
				type="search"
				id="search-input"
				oninput={() => (i.mode = 's')}
				placeholder="Search"
				bind:value={i.search}
				bind:this={$searchInput}
			/>
			{#if !i.search}
				<span aria-label="ctrlk">CTRL+K</span>
			{/if}
			{#if i.search}
				<button onclick={handlers(stopPropagation(bubble('click')), clearSearchInput)}
					><i id="clear-search" class="fas fa-xmark"></i></button
				>
			{/if}
		</div>
	</div>
	<OverlayScrollbarsComponent
		style="flex: 1 0 0;"
		options={{ scrollbars: { autoHide: 'scroll' } }}
		defer
	>
		<div class="aside-middle" bind:this={asideMid} onscroll={handleAsideScroll}>
			{#each Object.entries(modes) as [mode, v] (mode)}
				{#if !(mode === 's' && !i.search)}
					<a
						onclick={() => (i.mode = mode)}
						href="#"
						class="menu-items"
						class:active={i.mode === mode}
					>
						<i class={v.icon_classes}></i>
						<span class="menu-name">{v.text}</span>
						<span class="list-amount">{i[mode].length}</span>
					</a>
				{/if}
			{/each}
			<hr />
			{#each i.pinned_tasks as task (task.i)}
				<a
					onclick={() => {
						i.parent_task = task as Task;
						i.mode = 'p';
					}}
					class:active={i.parent_task?.i === task.i}
					href="#"
					class="menu-items"
				>
					<i class="fas fa-bars"></i>
					<span class="menu-name">{task.n}</span>
					<span class="list-amount">{task.c}</span>
				</a>
			{/each}
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
	.username-edit {
		font-size: inherit;
		padding: 0.6rem 0.8rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		background-color: #fff;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		width: auto;
		min-width: 180px;
	}
	.username-edit:focus {
		outline: none;
		border-color: #888;
		box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
	}
	.submit-username,
	.cancel-username {
		background: none;
		border: none;
		padding: 0 0.4rem;
		cursor: pointer;
		font-size: 1.1rem;
		color: #555;
		transition: color 0.2s ease;
	}
	.submit-username:hover,
	.cancel-username:hover {
		color: #000;
	}
</style>
