import axios from 'axios';
import type { Mode, Task } from './types';

class App {
	tasks: Task[] = $state([]);
	mode: Mode = $state('a');
	search: string = $state('');
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
	s: Task[] = $derived.by(async () => {
		return await axios.get('/');
	});
	p = $state(0)
}

export const i = new App();
