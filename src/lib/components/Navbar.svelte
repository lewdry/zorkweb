<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	const games = [
		{ id: 'zork-i', label: 'Zork I' },
		{ id: 'zork-ii', label: 'Zork II' },
		{ id: 'zork-iii', label: 'Zork III' }
	];

	let menuOpen = $state(false);

	function closeMenu() {
		menuOpen = false;
	}
</script>

<nav class="navbar bg-base-100 shadow-sm z-50 min-h-[4rem]" aria-label="Main navigation">
	<!-- Brand -->
	<div class="navbar-start">
		<a href="{base}/" class="btn btn-ghost text-lg font-bold tracking-tight" onclick={closeMenu}>
			Zork for the Web
		</a>
	</div>

	<!-- Desktop links -->
	<div class="navbar-end hidden md:flex">
		<ul class="menu menu-horizontal px-1 gap-1">
			<li>
				<a
					href="{base}/"
					class:active={$page.url.pathname === `${base}/` || $page.url.pathname === base}
					class="rounded-btn"
				>Home</a>
			</li>
			{#each games as game}
				<li>
					<a
						href="{base}/{game.id}"
						class:active={$page.url.pathname === `${base}/${game.id}`}
						class="rounded-btn"
					>{game.label}</a>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Mobile hamburger -->
	<div class="navbar-end md:hidden">
		<div class="dropdown dropdown-end" class:dropdown-open={menuOpen}>
			<button
				class="btn btn-ghost btn-circle"
				onclick={() => (menuOpen = !menuOpen)}
				aria-expanded={menuOpen}
				aria-label="Toggle menu"
			>
				<i class="fas {menuOpen ? 'fa-times' : 'fa-bars'} text-lg"></i>
			</button>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<ul
				class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg mt-2"
				role="menu"
				onclick={closeMenu}
				onkeydown={(e) => e.key === 'Escape' && closeMenu()}
			>
				<li role="menuitem"><a href="{base}/">Home</a></li>
				{#each games as game}
					<li role="menuitem"><a href="{base}/{game.id}">{game.label}</a></li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

<!-- Click-outside to close mobile menu -->
{#if menuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40" onclick={closeMenu} aria-hidden="true"></div>
{/if}
