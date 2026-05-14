import adapter from '@sveltejs/adapter-static'; // Change this line
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // SPA fallback for dynamic [game] routes
			precompress: false,
			strict: true
		}),
		paths: {
			base: '/zorkweb'
		},
		prerender: {
			entries: ['/zorkweb/']
		}
	}
};

export default config;