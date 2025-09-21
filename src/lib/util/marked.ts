import { marked } from 'marked';

export const md = (text: string) => marked.parse(text, { breaks: true, gfm: true });
