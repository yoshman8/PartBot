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
	// TODO
	pokeTimer: fromHumanTime('4 min'),
	timer: fromHumanTime('6 min'),
};
