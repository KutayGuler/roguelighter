import { redirect } from '@sveltejs/kit';

export function load() {
  redirect(300, '/examples/gui-text');
}
