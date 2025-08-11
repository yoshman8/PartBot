import { getScrabbleDex } from '@/database/games';
import { IS_ENABLED } from '@/enabled';
import { toId } from '@/tools';

import type { RequestHandler } from 'express';

// TODO: Make this a prototype
function groupBy<Entry, Key extends string | number>(entries: Entry[], keyBy: (entry: Entry) => Key): Partial<Record<Key, Entry[]>> {
	return entries.reduce<Partial<Record<Key, Entry[]>>>((grouped, entry) => {
		const key = keyBy(entry);
		if (grouped[key]) grouped[key].push(entry);
		else grouped[key] = [entry];

		return grouped;
	}, {});
}

export const handler: RequestHandler = async (req, res) => {
	if (!IS_ENABLED.DB) throw new Error('Database is disabled.');
	const { user } = req.params as { user: string };
	const userId = toId(user);
	const allEntries = await getScrabbleDex();
	const results = allEntries!.filter(entry => entry.by === userId);
	const grouped = groupBy(
		results.map(res => res.pokemon.toUpperCase()),
		mon => mon.length
	);
	res.json(grouped);
};
