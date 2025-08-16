import { addUGOPoints, getUGOPlayed, setUGOPlayed } from '@/cache/ugo';
import { getScrabbleDex } from '@/database/games';
import { IS_ENABLED } from '@/enabled';
import { Board } from '@/ps/commands/points';
import { Games } from '@/ps/games';
import { parseMod } from '@/ps/games/mods';
import { checkWord } from '@/ps/games/scrabble/checker';
import { ScrabbleMods } from '@/ps/games/scrabble/constants';
import { ScrabbleModData } from '@/ps/games/scrabble/mods';
import { LB_STYLES } from '@/ps/other/leaderboardStyles';
import { isUGOActive } from '@/ps/ugo';
import { BOARD_GAMES_STRUCHNI_ORDER, CHAIN_REACTION_META } from '@/ps/ugo/constants';
import { toId } from '@/tools';
import { ChatError } from '@/utils/chatError';
import { mapValues } from '@/utils/map';
import { rankedSort } from '@/utils/rankedSort';

import type { UGOUserPoints } from '@/cache/ugo';
import type { ScrabbleDexEntry } from '@/database/games';
import type { ToTranslate, TranslationFn } from '@/i18n/types';
import type { GamesList } from '@/ps/games/types';
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
	const sortedData = rankedSort(
		usersData,
		({ count, points }) => [points, count],
		({ name, count, points }) => [name, count, points]
	);
	return (
		<Board
			headers={['#', $T('COMMANDS.POINTS.HEADERS.USER'), 'Unique', 'Points']}
			data={sortedData}
			asPage
			styles={LB_STYLES.orange}
		/>
	);
}

export function renderUGOBoardGamesLeaderboard(data: Record<string, UGOUserPoints>, $T: TranslationFn): ReactElement {
	const sortedData = rankedSort(
		Object.entries(data),
		([_name, entry]) => entry.total,
		([name, entry]) => [name, entry.total, ...BOARD_GAMES_STRUCHNI_ORDER.map(gameId => entry.breakdown[gameId] ?? 0)]
	);
	return (
		<center>
			<div style={{ margin: 48, overflowX: 'auto' }}>
				<Board
					headers={[
						'#',
						$T('COMMANDS.POINTS.HEADERS.USER'),
						'Total Points',
						...BOARD_GAMES_STRUCHNI_ORDER.map(gameId =>
							gameId in Games
								? (Games[gameId as GamesList].meta.abbr ?? Games[gameId as GamesList].meta.name)
								: CHAIN_REACTION_META.abbr
						),
					]}
					data={sortedData}
					asPage
					style={{ width: 640 }}
					styles={LB_STYLES.orange}
				/>
			</div>
		</center>
	);
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
		help: "Shows a user's current ScrabbleDex for UGO.",
		syntax: 'CMD [user?]',
		flags: { allowPMs: true },
		categories: ['game'],
		children: {
			leaderboard: {
				name: 'leaderboard',
				help: 'Shows the current ScrabbleDex leaderboard for UGO.',
				syntax: 'CMD',
				aliases: ['board', 'lb', 'top'],
				async run({ message, $T }) {
					if (!IS_ENABLED.DB) throw new ChatError($T('DISABLED.DB'));
					const entries = await getScrabbleDex();
					message.author.pageHTML(renderScrabbleDexLeaderboard(entries!, $T), { name: 'scrabbledex' });
				},
			},
		},
		async run({ message, broadcastHTML, arg, $T }) {
			if (!IS_ENABLED.DB) throw new ChatError($T('DISABLED.DB'));
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
