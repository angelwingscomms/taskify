<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import { create_toast } from '$lib/toast';

	let is_new_account = false;
	let email = '';
	let password = '';
	let confirm_password = '';

	function toggle_new_account_mode() {
		is_new_account = !is_new_account;
		// Clear password fields when toggling mode
		password = '';
		confirm_password = '';
	}

	function validate_client_side(): boolean {
		if (!email || !password) {
			create_toast({ message: 'Email and password are required.', type: 'error' });
			return false;
		}
		if (is_new_account && password !== confirm_password) {
			create_toast({ message: 'Passwords do not match.', type: 'error' });
			return false;
		}
		return true;
	}
</script>

<div class="bg-gray-100 flex min-h-screen flex-col items-center justify-center">
	<div
		class="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
		in:fade={{ duration: 150 }}
		out:fade={{ duration: 150 }}
	>
		<h1 class="text-2xl font-bold mb-6 text-center">
			{is_new_account ? 'Create Account' : 'Login'}
		</h1>

		<form
			method="POST"
			action="?/authenticate"
			use:enhance={() => {
				if (!validate_client_side()) {
					return async ({ update }) => {}; // Prevent form submission
				}
				return async ({ result }) => {
					if (result.type === 'failure') {
						create_toast({
							message: result.data?.message || 'Authentication failed.',
							type: 'error'
						});
					} else if (result.type === 'success') {
						create_toast({
							message: is_new_account ? 'Account created successfully!' : 'Logged in successfully!',
							type: 'success'
						});
						window.location.href = '/'; // Redirect to home on success
					}
					await update();
				};
			}}
		>
			<div class="mb-4">
				<label for="email" class="text-gray-700 text-sm font-bold mb-2 block">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					bind:value={email}
					class="shadow rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline w-full appearance-none border focus:outline-none"
					required
				/>
			</div>
			<div class="mb-4">
				<label for="password" class="text-gray-700 text-sm font-bold mb-2 block">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={password}
					class="shadow rounded py-2 px-3 text-gray-700 mb-3 leading-tight focus:shadow-outline w-full appearance-none border focus:outline-none"
					required
				/>
			</div>

			{#if is_new_account}
				<div class="mb-6" transition:fade={{ duration: 150 }}>
					<label for="confirm_password" class="text-gray-700 text-sm font-bold mb-2 block"
						>Confirm Password</label
					>
					<input
						type="password"
						id="confirm_password"
						name="confirm_password"
						bind:value={confirm_password}
						class="shadow rounded py-2 px-3 text-gray-700 mb-3 leading-tight focus:shadow-outline w-full appearance-none border focus:outline-none"
						required
					/>
				</div>
			{/if}

			<input type="hidden" name="is_new_account" value={is_new_account ? 'true' : 'false'} />

			<div class="flex items-center justify-between">
				<button
					type="submit"
					class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:shadow-outline w-full focus:outline-none"
				>
					{is_new_account ? 'Create Account' : 'Login'}
				</button>
			</div>
		</form>

		<div class="mt-4 text-center">
			<button
				on:click={toggle_new_account_mode}
				class="font-bold text-sm text-blue-500 hover:text-blue-800 inline-block align-baseline"
			>
				{is_new_account ? 'Already have an account? Login' : 'Create Account'}
			</button>
		</div>

		<div class="mt-6 text-center">
			<a
				href="/google"
				class="font-bold text-sm text-red-500 hover:text-red-800 border-red-500 py-2 px-4 rounded inline-block w-full border align-baseline"
			>
				Login with Google
			</a>
		</div>
	</div>
</div>
