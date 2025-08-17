import { PSGames } from '@/cache';
import { usePersistedCache } from '@/cache/persisted';
import { Games } from '@/ps/games';
import { sleep } from '@/utils/sleep';

import type { NoTranslate } from '@/i18n/types';
import type { GamesList } from '@/ps/games/types';
import type { PSCommand } from '@/types/chat';

const openGamesCache = usePersistedCache('openGames');

export const command: PSCommand = {
	name: 'kill',
	help: 'Kills the bot.',
	syntax: 'CMD',
	flags: { allowPMs: true },
	perms: 'admin',
	categories: ['utility'],
	async run({ message }) {
		await Promise.any([message.reply(';-;' as NoTranslate), sleep('2s')]);

		// Note which games are currently open
		const openGames = (Object.keys(Games) as GamesList[]).flatMap(gameType =>
			Object.values(PSGames[gameType] ?? {}).map(game => ({ gameType: game.meta.id, id: game.id, roomid: game.roomid }))
		);
		openGamesCache.set(openGames);

		process.exit();
	},
};
