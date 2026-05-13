<script>
	const games = [
		{
			id: 'zork-i',
			title: 'Zork I',
			subtitle: 'The Great Underground Empire',
			description:
				'Begin your descent into the Great Underground Empire. Navigate treacherous passages, battle a lurking Grue, and uncover the twenty treasures of Zork.',
			badge: 'Start Here',
			themeColor: 'accent'
		},
		{
			id: 'zork-ii',
			title: 'Zork II',
			subtitle: 'The Wizard of Frobozz',
			description:
				'Delve deeper beneath Zork I. Face the capricious Wizard of Frobozz and his erratic magic as you seek passage through the Land of the Dead.',
			badge: 'Sequel',
			themeColor: 'secondary'
		},
		{
			id: 'zork-iii',
			title: 'Zork III',
			subtitle: 'The Dungeon Master',
			description:
				'The final chapter. The Dungeon Master tests your wisdom over your sword arm. Prove yourself worthy to inherit the mantle of the Empire.',
			badge: 'Conclusion',
			themeColor: 'primary'
		}
	];
</script>

<svelte:head>
	<title>Zork Web — The Great Underground Empire</title>
	<meta
		name="description"
		content="Play Zork I, II, and III in your browser. A modern chat-bubble interface powered by the JSZM engine."
	/>
</svelte:head>

<!-- Hero -->
<section class="hero min-h-[calc(100dvh-4rem)] bg-base-200">
	<div class="hero-content text-center flex-col gap-8 pt-4 pb-16 px-4">
		<div class="max-w-2xl">
			<h1 class="text-5xl font-bold leading-tight mb-4">
				Welcome to the<br />Great Underground Empire
			</h1>
			<p class="text-base-content/70 text-lg leading-relaxed max-w-xl mx-auto">
				Zork is one of the most influential video games of all time. Released in 1980, Zork is a classic of the interactive fiction genre. Zork Web presents the classic, unaltered games Zork I, II and III in a modern chat interface for any device.
			</p>
		</div>

		<!-- Game cards -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
			{#each games as game}
				<a
					href="/{game.id}"
					class="card bg-base-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group overflow-hidden"
				>
					<!-- Colored top accent bar -->
					<div
						class="h-1 w-full"
						class:bg-accent={game.themeColor === 'accent'}
						class:bg-secondary={game.themeColor === 'secondary'}
						class:bg-primary={game.themeColor === 'primary'}
					></div>
					<div class="card-body items-center text-center gap-3">
						<div class="badge badge-outline badge-sm">{game.badge}</div>
						<h2
							class="card-title text-xl group-hover:text-accent transition-colors"
							class:group-hover:text-secondary={game.themeColor === 'secondary'}
							class:group-hover:text-primary={game.themeColor === 'primary'}
						>
							{game.title}
						</h2>
						<p class="text-xs font-medium opacity-60 -mt-2">{game.subtitle}</p>
						<p class="text-sm opacity-70 leading-relaxed">{game.description}</p>
						<div class="card-actions mt-2">
							<span
								class="btn btn-accent btn-sm"
								class:btn-secondary={game.themeColor === 'secondary'}
								class:btn-primary={game.themeColor === 'primary'}
							>
								Play Now
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Lore blurb -->
		<div class="prose prose-sm max-w-xl mx-auto text-base-content/60 text-center">
			<p>
				In 2025 Microsoft released the historical Zork source code under the MIT licence. This unaffiliated fan project is a tribute.
			</p>
			<p>
				Whether you're revisiting a cherished memory or encountering a Grue for the first time,
				your journey awaits.
			</p>
		</div>
	</div>
</section>
