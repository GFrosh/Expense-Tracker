export const qs = (s: string): Element | null => document.querySelector(s);
export const qsa = (s: string): NodeListOf<Element> => document.querySelectorAll(s);