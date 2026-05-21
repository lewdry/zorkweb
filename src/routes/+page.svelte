<script>
	import { base } from "$app/paths";

	const games = [
		{
			id: "zork-i",
			title: "Zork I",
			subtitle: "The Great Underground Empire",
			description:
				"Begin your descent into the Underground Empire. Navigate treacherous passages, battle a lurking Grue, and uncover the twenty treasures of Zork.",
			badge: "Start Here",
			themeColor: "accent",
		},
		{
			id: "zork-ii",
			title: "Zork II",
			subtitle: "The Wizard of Frobozz",
			description:
				"The adventure continues deeper beneath the earth. Outwit the erratic magic of the Wizard of Frobozz to find your way through the Land of the Dead.",
			badge: "The Sequel",
			themeColor: "secondary",
		},
		{
			id: "zork-iii",
			title: "Zork III",
			subtitle: "The Dungeon Master",
			description:
				"The final chapter. The Dungeon Master tests your wisdom over your sword arm. Prove yourself worthy to inherit the mantle of the Empire.",
			badge: "The End",
			themeColor: "primary",
		},
	];
</script>

<svelte:head>
	<title>Zork for the Web</title>
	<meta
		name="description"
		content="Play Zork I, II, and III in your browser. A modern message interface powered by the JSZM engine, Svelte and Daisy UI."
	/>
	<meta name="author" content="Lewis Dryburgh" />
	<meta name="robots" content="index, follow" />
	<meta property="og:title" content="Zork for the Web" />
	<link rel="canonical" href="https://lewdry.github.io/zorkweb" />
	<meta
		property="og:description"
		content="Play Zork I, II, and III in your browser. A modern message interface powered by the JSZM engine, Svelte and Daisy UI."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<!-- Hero -->

<section class="hero min-h-[calc(100dvh-4rem)] bg-base-200">
	<div class="hero-content text-center flex-col gap-8 pt-4 pb-16 px-4">
		<div class="max-w-2xl">
			<h1 class="text-2xl md:text-3xl font-bold leading-tight mb-4">
				Welcome to the<br />Great Underground Empire
			</h1>
			<p
				class="text-base-content/70 text-base leading-relaxed max-w-xl mx-auto"
			>
				Zork has defined interactive fiction since its release in 1977.<br />
				Zork for the Web runs the original source code in a modern chat interface, with optional voice mode.
			</p>
		</div>

		<!-- Game cards -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
			{#each games as game}
				<a
					href="{base}/{game.id}"
					class="card bg-neutral shadow-xl transition-all duration-200 group overflow-hidden"
				>
					<!-- Colored top accent bar -->
					<div
						class="h-1 w-full"
						class:bg-accent={game.themeColor === "accent"}
						class:bg-secondary={game.themeColor === "secondary"}
						class:bg-primary={game.themeColor === "primary"}
					></div>
					<div class="card-body items-center text-center gap-3">
						<div class="badge badge-outline badge-sm">
							{game.badge}
						</div>
						<h2
							class="card-title text-xl group-hover:text-accent transition-colors"
							class:group-hover:text-secondary={game.themeColor ===
								"secondary"}
							class:group-hover:text-primary={game.themeColor ===
								"primary"}
						>
							{game.title}
						</h2>
						<p class="text-xs font-medium opacity-60 -mt-2">
							{game.subtitle}
						</p>
						<p class="text-sm opacity-70 leading-relaxed">
							{game.description}
						</p>
						<div class="card-actions mt-2">
							<span
								class="btn btn-accent btn-sm"
								class:btn-secondary={game.themeColor ===
									"secondary"}
								class:btn-primary={game.themeColor ===
									"primary"}
							>
								Play Now
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Lore blurb -->
		<div
			class="prose prose-xs max-w-xl mx-auto text-base-content/40 text-center mb-0 p-0"
		>
			<p class="text-sm leading-snug mb-0 p-0">
				Zork for the Web is an independent fan project made possible by
				Microsoft's 2025 release of the Zork source code. It makes the
				original trilogy accessible to everyone, returning fans or new
				players.
			</p>
			<div class="my-2"></div>
			<!-- Copyright blurb -->
			<p class="text-sm leading-snug mb-0 p-0">
				Zork for the Web is not affiliated with Microsoft or Activision.
				Zork is a registered trademark of its respective owners. The web
				interface is a non-commercial, open-source project under the MIT
				License.
			</p>
			<div class="my-2"></div>
			<!-- Footer -->
			<p class="text-sm leading-snug mb-0 p-0">
				   Zork for the Web by <a href="https://lewisdryburgh.com" target="_blank" rel="noopener noreferrer">Lewis Dryburgh</a>
			</p>
		</div>
	</div>
</section>
