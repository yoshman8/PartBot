import { getGameById, normalizeGame } from '@/database/games';
import { IS_ENABLED } from '@/enabled';
import { Games } from '@/ps/games';
import { WebError } from '@/utils/webError';

import type { RequestHandler } from 'express';

export const handler: RequestHandler = async (req, res, next) => {
	if (!IS_ENABLED.DB) throw new Error('Database is disabled.');
	const { game: gameType, gameId } = req.params as { game: string; gameId: string };
	if (!Object.keys(Games).includes(gameType)) return next();
	try {
		const record = (await getGameById(gameType, gameId))!;
		const game = normalizeGame(record);
		res.json(game);
	} catch (err: unknown) {
		if (err instanceof Error) throw new WebError(err.message, 404);
	}
};
