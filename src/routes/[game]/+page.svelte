<script>
	import ZPlayer from '$lib/components/ZPlayer.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.gameName} — Zork Web</title>
	<meta name="description" content="Play {data.gameName}: {data.gameSubtitle} in your browser." />
</svelte:head>

<ZPlayer
	gameId={data.gameId}
	romPath={data.romPath}
	gameName={data.gameName}
	gameSubtitle={data.gameSubtitle}
	themeColor={data.themeColor}
	coverImage={data.coverImage}
/>
