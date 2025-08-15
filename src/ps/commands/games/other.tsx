import { addUGOPoints, getUGOPlayed, setUGOPlayed } from '@/cache/ugo';
import { getScrabbleDex } from '@/database/games';
import { Board } from '@/ps/commands/points';
import { parseMod } from '@/ps/games/mods';
import { checkWord } from '@/ps/games/scrabble/checker';
import { ScrabbleMods } from '@/ps/games/scrabble/constants';
import { ScrabbleModData } from '@/ps/games/scrabble/mods';
import { isUGOActive } from '@/ps/ugo';
import { CHAIN_REACTION_META } from '@/ps/ugo/constants';
import { toId } from '@/tools';
import { ChatError } from '@/utils/chatError';
import { mapValues } from '@/utils/map';

import type { ScrabbleDexEntry } from '@/database/games';
import type { ToTranslate, TranslationFn } from '@/i18n/types';
import type { PSCommand } from '@/types/chat';
import type { ReactElement } from 'react';

export function renderScrabbleDexLeaderboard(entries: ScrabbleDexEntry[], $T: TranslationFn): ReactElement {
	const usersData = Object.values(entries.groupBy(entry => entry.by) as Record<string, ScrabbleDexEntry[]>).map(entries => {
		const name = entries.findLast(entry => entry.byName)?.byName ?? entries[0].by;
		const uniqueMons = entries.map(entry => entry.pokemon).unique();
		const count = uniqueMons.length;
		const points = uniqueMons.map(mon => Math.max(1, mon.length - 4)).sum();
		return { name, count, points };
	});
	const sortedData = usersData
		.sortBy(({ count, points }) => [points, count], 'desc')
		.map(({ name, count, points }, index, data) => {
			let rank = index;

			const getPointsKey = (entry: { count: number; points: number }): string => [entry.count, entry.points].join(',');
			const userPointsKey = getPointsKey({ count, points });

			while (rank > 0) {
				const prev = data[rank - 1];
				if (getPointsKey(prev) !== userPointsKey) break;
				rank--;
			}

			return [rank + 1, name, count, points];
		});
	return <Board headers={['#', $T('COMMANDS.POINTS.HEADERS.USER'), 'Unique', 'Points']} data={sortedData} />;
}

export const command: PSCommand[] = [
	{
		name: 'checkword',
		help: 'Checks the legality of a word according to the Scrabble dictionary.',
		syntax: 'CMD word[, mod]',
		flags: { allowPMs: true },
		aliases: ['cw'],
		categories: ['game'],
		async run({ broadcast, arg, $T }) {
			const [word, input = ScrabbleMods.CSW24] = arg
				.toLowerCase()
				.replace(/[^a-z0-9,]/g, '')
				.lazySplit(',', 1);
			const mod = parseMod(input, ScrabbleMods, ScrabbleModData);
			if (!mod) throw new ChatError($T('GAME.MOD_NOT_FOUND', { mod: input }));
			const check = checkWord(word, mod);
			if (!check) broadcast($T('GAME.SCRABBLE.INVALID_WORD', { wordList: word }));
			else broadcast($T('GAME.SCRABBLE.VALID_WORD', { word: toId(word).toUpperCase(), mod: ScrabbleModData[mod].name }));
		},
	},
	{
		name: 'othellosequence',
		help: 'Sequence of fastest game in Othello.',
		syntax: 'CMD',
		categories: ['game'],
		async run({ broadcastHTML }) {
			broadcastHTML([['e6', 'f4'], ['e3', 'f6'], ['g5', 'd6'], ['e7', 'f5'], ['c5']].map(turns => turns.join(', ')).join('<br />'));
		},
	},
	{
		name: 'scrabbledex',
		help: "Shows a user's current Scrabble Dex for UGO.",
		syntax: 'CMD [user?]',
		flags: { allowPMs: true },
		categories: ['game'],
		async run({ message, broadcastHTML, arg, $T }) {
			const target = toId(arg) || message.author.id;
			const allEntries = await getScrabbleDex();
			const results = allEntries!.filter(entry => entry.by === target);
			const grouped = mapValues(
				results.map(res => res.pokemon.toUpperCase()).groupBy(mon => mon.length),
				mons => mons?.unique().sort()
			);

			if (!results.length) throw new ChatError("You don't have any entries yet!" as ToTranslate);

			broadcastHTML(
				<details>
					<summary>ScrabbleDex ({results.length} entries)</summary>
					{Object.entries(grouped).filterMap(([length, mons]) => {
						if (mons)
							return (
								<p>
									{length} ({mons.length}): {mons.sort().list($T)}
								</p>
							);
					})}
				</details>,
				{ name: `scrabbledex-${message.author.id}` }
			);
		},
	},
	{
		name: 'ugoexternal',
		help: 'Adds points for external UGO games.',
		syntax: 'CMD [winner], [...others]',
		flags: { allowPMs: true },
		perms: message => message.author.id === 'partprofessor',
		categories: ['game'],
		async run({ arg, message }) {
			if (!isUGOActive()) throw new ChatError("UGO isn't active!" as ToTranslate);
			const players = arg.split(',');
			const winner = players[0];

			const pointsData = Object.fromEntries(
				players
					.filter(player => {
						const prevCount = getUGOPlayed(CHAIN_REACTION_META.id, player);
						setUGOPlayed(CHAIN_REACTION_META.id, player, prevCount + 1);
						return prevCount <= CHAIN_REACTION_META.ugo.cap;
					})
					.map(player => [
						player.trim(),
						player === winner ? CHAIN_REACTION_META.ugo.points.win(players.length) : CHAIN_REACTION_META.ugo.points.loss,
					])
			);

			addUGOPoints.call(message.parent, pointsData, CHAIN_REACTION_META.id);
		},
	},
];
