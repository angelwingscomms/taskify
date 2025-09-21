// Define the type for a single toast notification
export type ToastType =
	| 'success'
	| 'error'
	| 'warning'
	| 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number; // Optional duration in ms, defaults to a standard value
	action?: {
		// New optional action property
		label: string;
		callback: () => void;
	};
}

// Create a writable store to hold an array of toasts
export const toasts: Toast[] = $state([])

// Function to add a new toast notification
export function addToast(
	message: string,
	type: ToastType = 'info',
	duration: number = 3000,
	action?: { label: string; callback: () => void }
) {
	const id =
		Date.now().toString() +
		Math.random().toString(36).substring(2, 9); // Simple unique ID

	toasts.push({
		id,
		message,
		type,
		duration,
		action
	})

	// Automatically remove the toast after its duration
	setTimeout(() => {
		removeToast(id);
	}, duration);
}

// Function to remove a toast notification by its ID
export function removeToast(id: string) {
	const index = toasts.findIndex(toast => toast.id === id);
	if (index !== -1) {
		toasts.splice(index, 1);
	}
}

// Helper functions for different toast types for convenience
export const toast = {
	success: (
		message: string,
		duration?: number,
		action?: { label: string; callback: () => void }
	) => addToast(message, 'success', duration, action),
	error: (
		message: string,
		duration?: number,
		action?: { label: string; callback: () => void }
	) => addToast(message, 'error', duration, action),
	warning: (
		message: string,
		duration?: number,
		action?: { label: string; callback: () => void }
	) => addToast(message, 'warning', duration, action),
	info: (
		message: string,
		duration?: number,
		action?: { label: string; callback: () => void }
	) => addToast(message, 'info', duration, action)
};
