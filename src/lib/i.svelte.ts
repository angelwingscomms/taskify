import type { Mode, Task } from './types';

class App {
	tasks: Task[] = $state([]);
	mode: Mode = $state('a');
	x: Task[] = $derived.by(() => {
		return i.tasks.filter((t) => !t.t && !t.c && t.x);
	});
	c: Task[] = $derived.by(() => {
		return i.tasks.filter((t) => !t.t && t.c);
	});
	t: Task[] = $derived.by(() => {
		return i.tasks.filter((t) => t.t);
	});
	a: Task[] = $derived.by(() => {
		return i.tasks.filter((t) => !t.t && !t.c);
	});
}

export const i = new App();
