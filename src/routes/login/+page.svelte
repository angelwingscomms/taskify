<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let is_new_user = false;
	let password = '';
	let confirm_password = '';
	let password_error: string | null = null;

	function toggle_new_user_mode() {
		is_new_user = !is_new_user;
		password_error = null; // Clear error when toggling
	}

	function handle_submit(event: Event) {
		// Reset error on new submission attempt
		password_error = null;

		if (is_new_user && password !== confirm_password) {
			event.preventDefault(); // Prevent form submission
			password_error = 'Passwords do not match.';
		}
	}
</script>

<div class="login-wrapper">
	<div class="login-card">
		<h1 class="login-title">
			{is_new_user ? 'Create Account' : 'Login'}
		</h1>

		{#if form?.message}
			<p class="server-message">{form.message}</p>
		{/if}

		<form method="POST" on:submit={handle_submit}>
			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input type="email" id="email" name="e" class="form-input" required />
			</div>
			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<input
					type="password"
					id="password"
					name="p"
					bind:value={password}
					class="form-input password-input"
					required
				/>
			</div>

			{#if is_new_user}
				<div class="form-group confirm-password-group" transition:fade={{ duration: 150 }}>
					<label for="confirm_password" class="form-label">Confirm Password</label>
					<input
						type="password"
						id="confirm_password"
						name="confirm_password"
						bind:value={confirm_password}
						class="form-input password-input"
						required
					/>
					{#if password_error}
						<p class="error-message">{password_error}</p>
					{/if}
				</div>
			{/if}

			<input type="hidden" name="n" bind:value={is_new_user} />

			<div class="button-group">
				<button type="submit" class="main-button">
					{is_new_user ? 'Create Account' : 'Login'}
				</button>
			</div>
		</form>

		<div class="mt-4 text-center">
			<button type="button" on:click={toggle_new_user_mode} class="toggle-mode-button">
				{is_new_user ? 'Already have an account? Login' : 'Create Account'}
			</button>
		</div>

		<div class="mt-6 text-center">
			<a href="/google" class="google-login-button"> Login with Google </a>
		</div>
	</div>
</div>

<style>
	/* ... existing styles ... */
	.error-message {
		color: crimson;
		font-size: 0.875rem; /* text-sm */
		margin-top: 0.5rem; /* mt-2 */
	}

	.server-message {
		color: crimson; /* Using crimson to indicate it's typically an error or important feedback */
		font-size: 0.875rem; /* text-sm */
		text-align: center;
		margin-top: -1rem; /* Adjust margin to pull it closer to the title */
		margin-bottom: 1.5rem; /* Space it appropriately from the form */
	}

	.login-wrapper {
		background-color: var(--clr-grey-200); /* Adjusted to a grey from app.css */
		display: flex;
		min-height: 100vh;
		min-height: 100dvh; /* For modern browsers */
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.login-card {
		background-color: var(--clr-white);
		padding: 2rem;
		border-radius: 0.5rem; /* Equivalent to rounded-lg */
		box-shadow: 0 2px 7px rgba(0, 0, 0, 0.14); /* Similar to app.css dropdown shadow */

		width: 100%;
	}

	.login-title {
		font-size: 1.5rem; /* Equivalent to text-2xl */
		font-weight: 700; /* Equivalent to font-bold */
		margin-bottom: 1.5rem; /* Equivalent to mb-6 */
		text-align: center;
		color: var(--clr-main);
	}

	.form-group {
		margin-bottom: 1rem; /* Equivalent to mb-4 */
	}

	.form-group.confirm-password-group {
		margin-bottom: 1.5rem; /* Equivalent to mb-6 */
	}

	.form-label {
		color: var(--clr-main); /* Similar to text-gray-700 */
		font-size: 0.875rem; /* Equivalent to text-sm */
		font-weight: 700; /* Equivalent to font-bold */
		margin-bottom: 0.5rem; /* Equivalent to mb-2 */
		display: block;
	}

	.form-input {
		border-radius: 0.25rem; /* Equivalent to rounded */
		padding: 0.5rem 0.75rem; /* Equivalent to py-2 px-3 */
		color: var(--clr-main); /* Similar to text-gray-700 */
		line-height: 1.25; /* Equivalent to leading-tight */
		width: 100%;
		appearance: none;
		border: 1px solid var(--clr-grey-500); /* Using a grey from app.css */
		outline: none;
		transition:
			border-color 150ms ease,
			box-shadow 150ms ease;
	}

	.form-input:focus {
		border-color: var(--clr-main);
		box-shadow: 0 0 0 2px hsla(201, 25%, 20%, 0.3); /* Custom focus shadow */
	}

	.password-input {
		margin-bottom: 0.25rem; /* Adjusted from mb-3 to accommodate error message */
	}

	.button-group {
		display: flex; /* Equivalent to flex */
		align-items: center; /* Equivalent to items-center */
		justify-content: space-between; /* Equivalent to justify-between */
	}

	.main-button {
		background-color: var(--clr-main);
		color: var(--clr-white);
		font-weight: 700; /* Equivalent to font-bold */
		padding: 0.5rem 1rem; /* Equivalent to py-2 px-4 */
		border-radius: 0.25rem; /* Equivalent to rounded */
		width: 100%;
		border: none;
		outline: none;
		cursor: pointer;
		transition:
			background-color 150ms ease,
			box-shadow 150ms ease;
	}

	.main-button:hover {
		background-color: var(--clr-main-dull);
	}

	.main-button:focus {
		box-shadow: 0 0 0 2px hsla(201, 25%, 20%, 0.3);
	}

	.toggle-mode-button {
		font-weight: 700; /* Equivalent to font-bold */
		font-size: 0.875rem; /* Equivalent to text-sm */
		color: var(--clr-main); /* Using main color for consistency */
		display: inline-block;
		vertical-align: baseline;
		background: none;
		border: none;
		cursor: pointer;
		outline: none;
		transition: color 150ms ease;
	}

	.toggle-mode-button:hover {
		color: var(--clr-main-dull); /* Darker shade on hover */
	}

	.google-login-button {
		font-weight: 700; /* Equivalent to font-bold */
		font-size: 0.875rem; /* Equivalent to text-sm */
		color: crimson; /* Retaining red color for Google */
		border: 1px solid crimson; /* Equivalent to border-red-500 */
		padding: 0.5rem 1rem; /* Equivalent to py-2 px-4 */
		border-radius: 0.25rem; /* Equivalent to rounded */
		display: inline-block;
		width: 100%;
		vertical-align: baseline;
		text-align: center;
		text-decoration: none; /* Remove underline from anchor */
		transition: all 150ms ease;
	}

	.google-login-button:hover {
		background-color: crimson;
		color: var(--clr-white);
	}

	/* Handling margins for buttons divs */
	.login-card > div.text-center {
		margin-top: 1rem; /* Equivalent to mt-4 */
	}

	.login-card > div.text-center:last-of-type {
		margin-top: 1.5rem; /* Equivalent to mt-6 */
	}
</style>
