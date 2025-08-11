import { Games } from '@/ps/games';

import type { UIRouteHandler } from '@/types/web';

export const handler: UIRouteHandler = (req, res, next) => {
	const { game: gameType } = req.params as { game: string; gameId: string };
	if (!Object.keys(Games).includes(gameType)) return next();
	res.getBundle(gameType, `${gameType.charAt(0).toUpperCase() + gameType.substring(1)} Replay`);
};
