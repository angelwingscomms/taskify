import { writable } from 'svelte/store';
import { arrayStore, numberStore, stringStore } from './utilities/store';
import type { Task } from './types';

export const searchInput = writable<HTMLInputElement | null>(null);
export const taskInput = writable<HTMLInputElement | null>(null);
export const showPD = writable<boolean>(false);
export const show_ma = writable<boolean>(false);
export const sidebarOverlay = writable<boolean>(false);
export const taskDropdownOverlay = writable<boolean>(false);
export const inputOverlay = writable<boolean>(false);
export const modalOverlay = writable<boolean>(false);
export const showPropSm = writable<boolean>(false);
export const sideBarOpen = writable<boolean>(false);
export const modalOpened = writable<boolean>(false);
export const breakpoint = writable<MediaQueryList | null>(null);
export const offlineTasks = arrayStore<Task>('offlineTasks', []);
export const nextOfflineId = numberStore('nextOfflineId');
