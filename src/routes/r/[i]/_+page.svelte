<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { ChatMessage } from '$lib/types'; // Import the new type
	import { toast } from '$lib/util/toast';
	import { PUBLIC_WORKER } from '$env/static/public';
	import axios from 'axios';

	let chat_messages: ChatMessage[] = $state([]);
	let message_text = '';
	let websocket: WebSocket | undefined;
	$effect(() => {
		websocket = new WebSocket('ws' + PUBLIC_WORKER + '/' + page.params.i);

		websocket.onopen = () => {
			console.log('WebSocket connection opened.');
		};

		// Listen for messages
		websocket.onmessage = (event) => {
			console.log('event', event);
			try {
				// const message: ChatMessage = JSON.parse(event.data);
				chat_messages = [...chat_messages, {t: event.data}];
				console.log(chat_messages)
			} catch (e) {
				console.error('Error parsing message data', e);
				toast.error('Error receiving message.');
			}
		};

		// Connection closed
		websocket.addEventListener('close', (event) => {
			console.log('WebSocket connection closed.', event.code, event.reason);
			chat_messages = [
				...chat_messages,
				{
					u: 'system',
					t: 'Connection lost. Please refresh.',
					ts: new Date().toISOString(),
					r: chat_id,
					s: 'm'
				}
			];
			toast.error('Chat connection lost.');
		});

		// Connection error
		websocket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
			toast.error('WebSocket error.');
		});
		
		return () => {
			if (websocket) {
				websocket.close();
				websocket = undefined; // Clear the socket reference
			}
		};
	});
	// Simple random user ID. In a real app, this would come from user authentication (e.g., locals.user.u)
	// For this example, we'll use a random one, but the +server.js uses the authenticated user's ID.

	const chat_id = page.params.i;

	function send_message() {
		console.log('to send');
		// websocket.send(message_text);
		axios.post(page.url, message_text)
		return;
		if (message_text && websocket) {
			console.log('..send');
			websocket.send(message_text);
			console.log('sent');
			message_text = '';
		} else if (websocket && websocket.readyState !== WebSocket.OPEN) {
			toast.error('Cannot send message: WebSocket is not open.');
		}
	}
</script>

<div class="chat-layout">
	<h1 class="chat-title">Chat Room: {chat_id}</h1>
	<div class="messages-container">
		{#each chat_messages as msg (Math.random())} //TODO
			<div class="message-item" in:fade={{ duration: 150, delay: 0 }} out:fade={{ duration: 150 }}>
				{#if msg.u === 'system'}
					<em class="message-system text-white">{msg.t}</em>
				{:else}
					<strong class="message-user text-blue-300">{msg.u}:</strong> <span class="message-text">{msg.t}</span>
				{/if}
			</div>
		{/each}
	</div>
	<div class="input-area">
		<input
			type="text"
			class="message-input"
			bind:value={message_text}
			onkeydown={(e) => e.key === 'Enter' && send_message()}
			placeholder="Type a message..."
		/>
		<button class="send-button" onclick={send_message}>Send</button>
	</div>
</div>
