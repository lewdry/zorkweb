import adapter from '@sveltejs/adapter-static'; // Change this line
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: 'index.html', // SPA fallback for dynamic [game] routes
            precompress: false,
            strict: true
        })
	}
};

export default config;