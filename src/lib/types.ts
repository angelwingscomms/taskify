export type Task = {
	t?: number; // trash
	c?: number; // completed
	x?: number; // important
	y?: number; // today
	d: number; // date
	n: string; // name
	a?: string[]; //ancestors
	dc?: string[]; //descendants/children
	s?: string; // tenant-id
	u?: string; // user
	i: string; // id
	o?: boolean; // offline,
	p: number; // position
};

export interface User {
	t?: string; // user tag/name
	e: string; // email
	s?: string; // tenant-id
	ph: string; // password hash
	p: string; // picture
	i: string; // id
	// p: string; // This seems to be a position field, not needed for User authentication context.
}

export type Mode = 
 | 't' // trash
 | 'x' // important
 | 'c' // completed
 | 'a' // all tasks
 | 's' // search results
 | 'y' // today
 | 'p'; // parent task
