import type { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';

export const scrollContent = (osTarget: OverlayScrollbarsComponent | undefined) => {
	const osInstance = osTarget?.osInstance();
	if (!osInstance) {
		return;
	}
	const { scrollOffsetElement } = osInstance.elements();
	scrollOffsetElement.scrollTo({ behavior: 'smooth', top: 0 });
};
