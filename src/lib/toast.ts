// src/lib/toast.ts
import { writable } from 'svelte/store';

interface Toast {
	message: string;
	type: 'success' | 'error' | 'info';
	id: number;
}

export const toasts = writable<Toast[]>([]);

export function create_toast({ message, type }: { message: string; type: Toast['type'] }) {
	const id = Date.now();
	toasts.update((current_toasts) => [...current_toasts, { id, message, type }]);

	// Automatically remove toast after a few seconds
	setTimeout(() => {
		toasts.update((current_toasts) => current_toasts.filter((toast) => toast.id !== id));
	}, 3000); // 3 seconds
}
