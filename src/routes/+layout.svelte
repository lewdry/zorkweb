<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	const websiteSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Lewis Dryburgh',
		url: 'https://lewdry.github.io/'
	};
</script>

<svelte:head>
	<meta property="og:site_name" content="Lewis Dryburgh" />
	<meta property="og:image" content="https://lewdry.github.io/zorkweb/zork-preview.png" />
	<meta property="og:image:alt" content="Zork for the Web preview image" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://lewdry.github.io/zorkweb/zork-preview.png" />
	<script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap"
		rel="stylesheet"
	/>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
	/>
</svelte:head>

<Navbar />
<div class="layout-main">
	{@render children()}
</div>
