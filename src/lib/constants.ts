import type { Mode } from "./types";

export const taskIndex = 't'
export const userIndex = 'u'
export const taskIdPrefix = 't_';
export const userIdPrefix = 'u_';
export const collection = 'i';
export const task_tenant_id = 'tk'
export const modes: Record<Mode, {icon_classes: string, text: string}> = {
  a: { icon_classes: 'fas fa-list-check', text: 'Inbox' },
  x: { icon_classes: 'far fa-flag', text: 'Important' },
  c: { icon_classes: 'far fa-circle-check', text: 'Completed' },
  t: { icon_classes: 'far fa-trash-can', text: 'Trash' },

}

