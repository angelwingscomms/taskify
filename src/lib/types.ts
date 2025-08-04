export type Task = {
	completed: number;
	name: string;
	important: number;
	trash: number;
	date: number;
  s?: string; //tenant-id
  u?: string; //user
  i?: string; //id
};

export interface User {
	t: string;
	p: string;
}

export interface TaskEvent {
  d: Task,
  t: 'a' | 'i'
}

export type Mode = 'trash' | 'important' | 'completed' | ''
