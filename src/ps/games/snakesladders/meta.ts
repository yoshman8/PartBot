import { GamesList } from '@/ps/games/types';
import { fromHumanTime } from '@/tools';

import type { Meta } from '@/ps/games/types';

export const meta: Meta = {
	name: 'Snakes & Ladders',
	id: GamesList.SnakesLadders,
	aliases: ['sl', 'snakesandladders', 'snakes'],

	players: 'many',
	minSize: 2,
	maxSize: 4,

	autostart: false,
	pokeTimer: fromHumanTime('30 sec'),
	timer: fromHumanTime('45 sec'),
};
