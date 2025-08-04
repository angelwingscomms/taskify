import { get, writable } from 'svelte/store';

// Define the type for a single toast notification
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number; // Optional duration in ms, defaults to a standard value
}

// Create a writable store to hold an array of toasts
export const toasts = writable<Toast[]>([]);

// Function to add a new toast notification
export function addToast(message: string, type: ToastType = 'info', duration: number = 3000) {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9); // Simple unique ID
    const newToast: Toast = { id, message, type, duration };

    toasts.update(currentToasts => [...currentToasts, newToast]);
    
    console.log('s', get(toasts))

    // Automatically remove the toast after its duration
    setTimeout(() => {
        removeToast(id);
    }, duration);
}

// Function to remove a toast notification by its ID
export function removeToast(id: string) {
    toasts.update(currentToasts => currentToasts.filter(toast => toast.id !== id));
}

// Helper functions for different toast types for convenience
export const toast = {
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
};