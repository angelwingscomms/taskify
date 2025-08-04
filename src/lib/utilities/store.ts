import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export const booleanStore = (key = '', initialValue = false) => {
	let previousValue: boolean;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<boolean>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, String(v)));
	return s;
};

export const numberStore = (key = '', initialValue = 0): Writable<number> => {
	let previousValue: number;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = Number(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<number>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, String(v)));
	return s;
};

export const stringStore = (key = '', initialValue = '') => {
	let previousValue: string;
	if (browser) {
		previousValue = localStorage.getItem(key) || initialValue;
	} else {
		previousValue = initialValue;
	}
	const s = writable<string>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, v));
	return s;
};

export const arrayStore = <Type>(key = '', initialValue: Array<Type>) => {
	let previousValue: Array<Type>;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<Array<Type>>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, JSON.stringify(v)));
	return s;
};

export const objectStore = (key = '', initialValue: object) => {
	let previousValue: object;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = JSON.parse(fromLocalStorage);
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<object>(previousValue);
	if (browser) s.subscribe((v) => localStorage.setItem(key, JSON.stringify(v)));
	return s;
};

export const typeStore = <Type>(key = '', initialValue: Type, resolve: (v: string) => Type) => {
	let previousValue: Type;
	if (browser) {
		const fromLocalStorage = localStorage.getItem(key);
		if (fromLocalStorage) {
			previousValue = resolve(fromLocalStorage)
		} else {
			previousValue = initialValue;
		}
	} else {
		previousValue = initialValue;
	}
	const s = writable<Type>(previousValue);
	if (browser)
		s.subscribe((v) => {
			localStorage.setItem(key, JSON.stringify(v));
		});
	return s;
};