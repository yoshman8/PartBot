import { PSGames } from '@/cache';
import { gameCache } from '@/cache/games';
import { usePersistedCache } from '@/cache/persisted';
import { i18n } from '@/i18n';
import { getLanguage } from '@/i18n/language';
import { Games } from '@/ps/games';
import { ChatError } from '@/utils/chatError';
import { Logger } from '@/utils/logger';

import type { Client, User } from 'ps-client';

const openGamesCache = usePersistedCache('openGames');

export function joinRoomHandler(this: Client, roomid: string, user: string, isIntro: boolean): void {
	if (isIntro) return;
	const room = this.getRoom(roomid);
	if (!room) return;

	const $T = i18n(getLanguage(room));

	// If we have any existing games, we need to update the room reference (since a new room object is created on reconnect)
	Object.values(PSGames)
		.flatMap(games => Object.values(games ?? {}))
		.filter(game => game.roomid === roomid)
		.forEach(game => {
			game.room = room;
		});

	const allBackups = openGamesCache.get();
	const gamesToRestore = allBackups.filter(backup => backup.roomid === roomid);
	gamesToRestore.forEach(toRestore => {
		try {
			const Game = Games[toRestore.gameType];
			const lookup = gameCache.get(toRestore.id);
			if (lookup.room !== toRestore.roomid) throw new ChatError($T('WRONG_ROOM'));
			if (lookup.game !== toRestore.gameType) throw new ChatError($T('GAME.RESTORING_WRONG_TYPE'));
			const game = new Game.instance({
				id: lookup.id,
				meta: Game.meta,
				room: room,
				$T,
				by: this.getUser(this.status.userid!) as User,
				backup: lookup.backup,
				args: [],
			});
			if (game.started) game.update();
			else game.signups();
		} catch (err) {
			if (err instanceof Error) {
				room.send(err.message);
				if (!(err instanceof ChatError)) Logger.errorLog(err);
			}
		}
	});
	if (allBackups.remove(...gamesToRestore)) openGamesCache.set(allBackups);
}
