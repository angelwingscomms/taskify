// src/lib/actions/trackTotalHeight.ts

import type { Writable } from 'svelte/store';

/**
 * A Svelte 5 action that tracks an element's offsetHeight plus its bottom
 * margin and writes the result into a provided $state signal.
 *
 * @param node The HTML element.
 * @param stateSignal The $state signal to update with the height.
 */
export const height_w_margin = (node: HTMLElement, stateSignal: number) => {
	const updateHeight = (v: number) => {
		const style = window.getComputedStyle(node);
		const marginBottom = parseFloat(style.marginBottom) || 0;
		// Mutate the signal passed from the component.
		// This is the key to making it work.
		v = node.offsetHeight + marginBottom;
	};

	const resizeObserver = new ResizeObserver(updateHeight);
	resizeObserver.observe(node);

	// Set initial value
	updateHeight(stateSignal);

	return {
		// The update function runs if the parameters to the action change.
		// Here, we just re-run the initial logic.
		update(newStateSignal: number) {
			stateSignal = newStateSignal;
			updateHeight(stateSignal);
		},

		destroy() {
			resizeObserver.disconnect();
		}
	};
};
