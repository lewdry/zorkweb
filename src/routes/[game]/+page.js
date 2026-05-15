import { base } from '$app/paths';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	const games = {
		'zork-i': {
			gameId: 'zork-i',
			gameName: 'Zork I',
			gameSubtitle: 'The Great Underground Empire',
			romPath: `${base}/roms/zork1.z3`,
			themeColor: 'accent',
			coverImage: `${base}/zork1.jpg`
		},
		'zork-ii': {
			gameId: 'zork-ii',
			gameName: 'Zork II',
			gameSubtitle: 'The Wizard of Frobozz',
			romPath: `${base}/roms/zork2.z3`,
			themeColor: 'secondary',
			coverImage: `${base}/zork2.jpg`
		},
		'zork-iii': {
			gameId: 'zork-iii',
			gameName: 'Zork III',
			gameSubtitle: 'The Dungeon Master',
			romPath: `${base}/roms/zork3.z3`,
			themeColor: 'primary',
			coverImage: `${base}/zork3.jpg`
		}
	};

	const game = games[params.game];
	if (!game) {
		return { status: 404, error: new Error(`Unknown game: ${params.game}`) };
	}

	return game;
}

export const prerender = true;
export const ssr = false;
