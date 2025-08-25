import { GamesList } from '@/ps/games/types';
import { fromHumanTime } from '@/utils/humanTime';

import type { Meta } from '@/ps/games/types';

export const meta: Meta = {
	name: 'Battleship',
	id: GamesList.Battleship,
	aliases: ['bs'],
	abbr: 'BS',
	players: 'many',

	turns: {
		A: 'A',
		B: 'B',
	},

	autostart: true,
	pokeTimer: fromHumanTime('30 sec'),
	timer: fromHumanTime('1 min'),

	// UGO-CODE
	ugo: {
		cap: 12,
		points: {
			win: 5,
			loss: 2,
		},
	},
};
