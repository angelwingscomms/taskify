import type { Action } from 'svelte/action';
export const labelOutsideClick: Action<HTMLLabelElement> = (label) => {
	window.onclick = (e) => {
		const input = document.getElementById(label.getAttribute('for') as string) as HTMLInputElement;
		if (!input.contains(e.target as Node) && !label.contains(e.target as Node)) {
			input.checked = false;
		}
	};
};
