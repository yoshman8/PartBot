import { GamesList } from '@/ps/games/types';
import { fromHumanTime } from '@/tools';

import type { Meta } from '@/ps/games/types';

export const meta: Meta = {
	name: 'Splendor',
	id: GamesList.Splendor,
	aliases: [],
	players: 'many',
	minSize: 2,
	maxSize: 4,

	autostart: false,
	pokeTimer: fromHumanTime('1 min'),
	timer: fromHumanTime('2 min'),

	// UGO-CODE
	ugo: {
		cap: 8,
		points: {
			win: 25,
			loss: 18,
		},
	},
};
