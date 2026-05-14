<script>
	import { base } from '$app/paths';

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
				'The adventure continues deeper beneath the earth. Outwit the erratic magic of the Wizard of Frobozz to find your way through the Land of the Dead.',
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
				Experience a classic of gaming history. Originally released in 1980, the Zork trilogy defined the interactive fiction genre.
			</p>
			<p class="text-base-content/70 text-lg leading-relaxed max-w-xl mx-auto">
				Zork Web presents Zork I, II and III with a modern chat interface for any device.
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
				Zork Web is an independent tribute made possible by Microsoft's 2025 release of the source code under the MIT license. We are dedicated to making this classic accessible to more people. Whether you are returning to an old favorite or meeting your first Grue, your journey starts here.
			</p> 
		</div>
	</div>
</section>
