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
	t?: string; // user tag/name
	e: string; // email
	s?: string // tenant-id
	ph: string; // password hash
  i: string; // id
	// p: string; // This seems to be a position field, not needed for User authentication context.
}

export type Mode = 't' | 'x' | 'c' | 'a' | 's';
