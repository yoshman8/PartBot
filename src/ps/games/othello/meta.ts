import { GamesList } from '@/ps/games/types';
import { fromHumanTime } from '@/utils/humanTime';

import type { Meta } from '@/ps/games/types';

export const meta: Meta = {
	name: 'Othello',
	id: GamesList.Othello,
	aliases: ['otgoodbye'],
	players: 'many',

	turns: {
		B: 'Black',
		W: 'White',
	},

	autostart: true,
	pokeTimer: fromHumanTime('30 sec'),
	timer: fromHumanTime('1 min'),

	// UGO-CODE
	ugo: {
		cap: 12,
		points: {
			win: 10,
			draw: 7,
			loss: 6,
		},
	},
};
