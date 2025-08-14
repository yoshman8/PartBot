import { Temporal } from '@js-temporal/polyfill';
import { uploadToPastie } from 'ps-client/tools';

import { usePersistedCache } from '@/cache/persisted';
import { TimeZone } from '@/ps/handlers/cron/constants';
import { BG_STRUCHNI_MODIFIER, BOARD_GAMES_STRUCHNI_ORDER, UGO_2025_SPOTLIGHTS } from '@/ps/ugo/constants';
import { toId } from '@/tools';
import { mapValues } from '@/utils/map';

import type { UGOBoardGames } from '@/ps/ugo/constants';
import type { Client } from 'ps-client';

export const UGO_PLAYED = usePersistedCache('ugoCap');

export function getUGOPlayed(game: UGOBoardGames, player: string): number {
	const playerId = toId(player);
	return UGO_PLAYED.get()[playerId]?.[game] ?? 0;
}
export function setUGOPlayed(game: UGOBoardGames, player: string, count: number | ((prevCount: number) => number)): void {
	const playerId = toId(player);
	const current = UGO_PLAYED.get();
	const currentCount = current[playerId]?.[game] ?? 0;
	(current[playerId] ??= {})[game] = typeof count === 'function' ? count(currentCount) : count;
	UGO_PLAYED.set(current);
}
export async function resetUGOPlayed(): Promise<string> {
	const backup = UGO_PLAYED.get();
	const url = await uploadToPastie(JSON.stringify(backup));
	UGO_PLAYED.set({});
	return url;
}

export const UGO_POINTS = usePersistedCache('ugoPoints');
export function getUGOPoints(player: string): { total: number; breakdown: Partial<Record<UGOBoardGames, number>> } {
	const playerId = toId(player);
	const data = UGO_POINTS.get()[playerId] ?? {};
	const games = Object.fromEntries(BOARD_GAMES_STRUCHNI_ORDER.map(game => [game, data[game] ?? 0])) as Partial<
		Record<UGOBoardGames, number>
	>;
	// Struchni
	const points = Math.floor(
		Object.values(games)
			.sortBy(null, 'desc')
			.reduce((sum, gamePoints, index) => sum + gamePoints * (1 + index * BG_STRUCHNI_MODIFIER))
	);

	return { total: points, breakdown: data };
}
export function addUGOPoints(this: Client, pointsData: Record<string, number>, game: UGOBoardGames, bypassBonus?: boolean): void {
	const bonus = !bypassBonus && UGO_2025_SPOTLIGHTS.some(date => Temporal.Now.plainDateISO(TimeZone.GMT).equals(date)) ? 1.5 : 1;
	const current = UGO_POINTS.get();

	const commit = mapValues(pointsData, (points, player) => {
		const playerId = toId(player);
		const updatedPoints = ((current[playerId] ??= {})?.[game] ?? 0) + Math.floor(points * bonus);

		current[playerId][game] = updatedPoints;
		return updatedPoints;
	});
	UGO_POINTS.set(current);

	uploadToPastie(JSON.stringify(commit, null, 2)).then(url => {
		this.addUser('ugo').send(`;setpointsfromjson boardgames, ${url}`);
	});
}
