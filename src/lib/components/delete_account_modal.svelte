<script lang="ts">
	import { i } from '$lib/i.svelte';
	import axios from 'axios';
	import { toast } from '$lib/util/toast';

	async function handle_delete_account() {
		try {
			await axios.delete('/delete_account');
			toast.success('Account deleted successfully. Redirecting to login...');
			// Redirect to login page after a short delay
			setTimeout(() => {
				window.location.href = '/login';
			}, 2000);
		} catch (error) {
			console.error('Error deleting account:', error);
			toast.error('An error occurred while deleting your account.');
		} finally {
			close_modal();
		}
	}

	function close_modal() {
		i.delete_account_open = false;
	}
</script>

{#if i.delete_account_open}
	<div class="modal-backdrop" onclick={close_modal}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Delete Account</h2>
			</div>
			<div class="modal-content">
				<p>Are you sure you want to permanently delete your account and all tasks linked solely to your account?</p>
			</div>
			<div class="modal-actions">
				<button type="button" onclick={close_modal}>No</button>
				<button onclick={handle_delete_account}>Yes</button>
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
	.modal-content {
		margin-bottom: 1.2rem;
		text-align: center;
		color: var(--text-color, #444);
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
