/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const games = {
		'zork-i': {
			gameId: 'zork-i',
			gameName: 'Zork I',
			gameSubtitle: 'The Great Underground Empire',
			romPath: '/roms/zork1.z3',
			themeColor: 'accent',
			coverImage: '/zork1.jpg'
		},
		'zork-ii': {
			gameId: 'zork-ii',
			gameName: 'Zork II',
			gameSubtitle: 'The Wizard of Frobozz',
			romPath: '/roms/zork2.z3',
			themeColor: 'secondary',
			coverImage: '/zork2.jpg'
		},
		'zork-iii': {
			gameId: 'zork-iii',
			gameName: 'Zork III',
			gameSubtitle: 'The Dungeon Master',
			romPath: '/roms/zork3.z3',
			themeColor: 'primary',
			coverImage: '/zork3.jpg'
		}
	};

	const game = games[params.game];
	if (!game) {
		return { status: 404, error: new Error(`Unknown game: ${params.game}`) };
	}

	return game;
}

export const prerender = false;
export const ssr = false;
