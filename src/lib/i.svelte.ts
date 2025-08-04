import type { Mode, Task } from './types';

export const i: { tasks: Task[]; offline_tasks: Task[]; mode: Mode } = $state({
  offline_tasks: [],
  tasks: [],
	mode: ''
});
