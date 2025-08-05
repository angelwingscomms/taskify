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
	s: Promise<Task[]> = $derived.by(async () => {
		if (!this.search) return;
		await new Promise((r) => setTimeout(r, 2160));
		const res = await axios.get('/?q=' + this.search);
		if (res.statusText === 'OK') return res.data;
	});
	p = $state(0);
}

export const i = new App();
