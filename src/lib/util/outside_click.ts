import type { Action } from 'svelte/action';

export const outside_click: Action = (node) => {
	document.addEventListener(
		'click',
		(event) => {
			if (
				node &&
				!node.contains(event.target as Node) &&
				!event.defaultPrevented
			)
				node.dispatchEvent(
					new CustomEvent('outside_click')
				);
		},
		true
	);
};
