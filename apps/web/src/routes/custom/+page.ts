import { redirect } from '@sveltejs/kit';

export function load() {
	// Redirect /custom to /egendefinert
	throw redirect(301, '/egendefinert');
}
