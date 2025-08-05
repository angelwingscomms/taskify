<script lang="ts">
	import { i } from '$lib/i.svelte';
	import axios from 'axios';

	let current_password = '';
	let new_password = '';
	let repeat_new_password = '';

	async function handle_submit(e: Event) {
		e.preventDefault();
		if (new_password !== repeat_new_password) {
			alert('New passwords do not match');
			return;
		}
		try {
			await axios.put('/edit_user', { p: new_password });
			alert('Password changed successfully');
			close_modal();
		} catch {
			alert('an error occured on our side');
		}
	}

	function close_modal() {
		i.change_password_open = false;
	}
</script>

{#if i.change_password_open}
	<div class="modal-backdrop" onclick={close_modal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Change Password</h2>
			</div>
			<div class="form-group">
				<label for="current-password">Current Password</label>
				<input id="current-password" type="password" bind:value={current_password} required />
			</div>
			<div class="form-group">
				<label for="new-password">New Password</label>
				<input id="new-password" type="password" bind:value={new_password} required />
			</div>
			<div class="form-group">
				<label for="repeat-new-password">Repeat New Password</label>
				<input id="repeat-new-password" type="password" bind:value={repeat_new_password} required />
			</div>
			<div class="modal-actions">
				<button type="button" onclick={close_modal}>Cancel</button>
				<button onclick={handle_submit}>Submit</button>
			</div>
		</div>
	</div>
{/if}

<style>
	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		background: var(--color-accent, #007bff);
		color: #fff;
		cursor: pointer;
		transition: background 0.2s ease;
	}
	button:hover {
		background: var(--color-accent-dark, #0056b3);
	}
	/* Modal Backdrop covering the entire screen with background blur */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(6px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}
	/* Centered Modal */
	.modal {
		background: var(--color-bg, #fff);
		border-radius: 8px;
		width: 90%;
		max-width: 450px;
		padding: 2rem;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
		animation: modalIn 0.3s ease-out;
	}
	@keyframes modalIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.modal-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--heading-color, #333);
	}
	.form-group {
		margin-bottom: 1.2rem;
		display: flex;
		flex-direction: column;
	}
	.form-group label {
		margin-bottom: 0.5rem;
		font-weight: bold;
		color: var(--text-color, #444);
	}
	.form-group input {
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.modal-actions button {
		min-width: 80px;
	}
	button[type='button'] {
		background: var(--secondary-color, #6c757d);
	}
	button[type='button']:hover {
		background: var(--secondary-color-dark, #5a6268);
	}
</style>
