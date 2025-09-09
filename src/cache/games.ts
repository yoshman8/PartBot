import { FlatCache } from 'flat-cache';

import { PSGames } from '@/cache';
import { fsPath } from '@/utils/fsPath';
import { fromHumanTime } from '@/utils/humanTime';

import type { GamesList } from '@/ps/games/types';

export type GameBackup = {
	room: string;
	id: string;
	at: number;
	game: GamesList;
	backup: string;
};

export type GameCache = {
	get(id: string): GameBackup;
	getByGame(room: string, game: GamesList | 'all'): GameBackup[];
	set(backup: GameBackup): void;
	delete(id: string): void;
	clearOldBackups(): void;
};

const cacheId = 'games.json';
const flatCache = new FlatCache({ cacheId: cacheId, cacheDir: fsPath('cache', 'flat-cache') });
flatCache.load(cacheId);

// This is the cache for game backups. For the actual game object, use cache.PSGames.
export const gameCache: GameCache = {
	get(id) {
		const lookup = flatCache.get<GameBackup>(id);
		if (!lookup) throw new Error(`Attempting to get ${id} but nothing found.`);
		return lookup;
	},
	getByGame(room, game) {
		const flatCacheObj: Record<string, GameBackup> = flatCache.all();
		const unfilteredGames = Object.values(flatCacheObj).filter(backup => backup.room === room);
		if (game === 'all') return unfilteredGames;
		return unfilteredGames.filter(backup => backup.game === game);
	},
	set(backup) {
		flatCache.set(backup.id, backup);
		flatCache.save();
	},
	delete(id) {
		flatCache.delete(id);
		flatCache.save();
	},
	clearOldBackups() {
		// Purge backups older than 7 days
		const flatCacheObj: Record<string, GameBackup> = flatCache.all();
		const stashedGames = Object.values(flatCacheObj).filter(game => !PSGames[game.game]?.[game.id]);
		const oldGames = stashedGames.filter(game => game.at < Date.now() - fromHumanTime('7 days'));
		oldGames.forEach(game => flatCache.delete(game.id));
		flatCache.save();
	},
};
