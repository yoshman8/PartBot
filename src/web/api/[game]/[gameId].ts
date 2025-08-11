import { getGameById } from '@/database/games';
import { IS_ENABLED } from '@/enabled';
import { WebError } from '@/utils/webError';

import type { RequestHandler } from 'express';

export const handler: RequestHandler = async (req, res) => {
	if (!IS_ENABLED.DB) throw new Error('Database is disabled.');
	const { game: gameType, gameId } = req.params as { game: string; gameId: string };
	try {
		const game = await getGameById(gameType, gameId);
		const serializable = game!.toJSON();
		res.json({ ...serializable, log: serializable.log.map(entry => JSON.parse(entry)) });
	} catch (err: unknown) {
		if (err instanceof Error) throw new WebError(err.message, 404);
	}
};
