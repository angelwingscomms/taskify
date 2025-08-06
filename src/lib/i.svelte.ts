import axios from 'axios';
import type { Mode, Task } from './types';

class App {
  tasks: Task[] = $state([]);
  pinned_tasks: (Pick<Task, 'i' | 'n'> & { c: number })[] = $state([]);
	mode: Mode = $state('a');
	search: string = $state('');
	editing_username = $state(false);
	delete_account_open = $state(false);
	show_prop_sm = $state(false);
	task_input_autofocus_off = $state(false);
	current_task: Task | null = $state(null)
	parent_task: Task | null = $state(null)
	change_password_open = $state(false);
	x: Task[] = $derived.by(() => {
		return i.tasks.filter((t) => !t.t && !t.c && t.x);
	});
	y: Task[] = $derived.by(() => {
		return i.tasks.filter((t) => !t.t && !t.c && t.y);
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
		if (!this.search) return; //todo - throttle?
		const res = await axios.post('/search' + { s: this.search});
		if (res.statusText === 'OK') return res.data;
	});
	subtasks: Promise<Task[]> = $derived.by(async () => {
		if (!this.current_task) return;
    const res = await axios.post('/search', { f: {a: this.current_task.i}});
		if (res.statusText === 'OK') return res.data;
	});
	p = $state(0);
}

export const i = new App();
