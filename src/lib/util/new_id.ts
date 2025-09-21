import { v7 } from 'uuid';

export function new_id(): string {
	return v7()
}