import { GamesList } from '@/ps/games/types';
import { fromHumanTime } from '@/tools';

import type { Meta } from '@/ps/games/types';

export const meta: Meta = {
	name: 'Snakes & Ladders',
	id: GamesList.SnakesLadders,
	aliases: ['sl', 'snakesandladders', 'snakesnladders', 'snakes', 'snek'],
	abbr: 'Snakes',

	players: 'many',
	minSize: 2,
	maxSize: 4,

	autostart: true,
	pokeTimer: fromHumanTime('30 sec'),
	timer: fromHumanTime('45 sec'),

	// UGO-CODE
	ugo: {
		cap: 20,
		points: {
			win: 3,
			loss: 2,
		},
	},
};
