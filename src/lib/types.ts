export type Task = {
	t?: number; // trash
	c?: number; // completed
	x?: number; // important
	d: number; // date
	n: string; // name
	s?: string; // tenant-id
	u?: string; // user
	i: string; // id
	o?: boolean; // offline,
	p: number; // position
};

export interface User {
	t: string;
	p: string;
}

export type Mode = 't' | 'x' | 'c' | 'a' | 's';
