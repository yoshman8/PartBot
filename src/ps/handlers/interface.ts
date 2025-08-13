import { PSGames } from '@/cache';
import { prefix } from '@/config/ps';
import { getScrabbleDex } from '@/database/games';
import { IS_ENABLED } from '@/enabled';
import { i18n } from '@/i18n';
import { getLanguage } from '@/i18n/language';
import { renderScrabbleDexLeaderboard } from '@/ps/commands/games/other';
import { toId } from '@/tools';
import { ChatError } from '@/utils/chatError';

import type { PSMessage } from '@/types/ps';

export function interfaceHandler(message: PSMessage) {
	// Ignore & messages
	if (message.isIntro || !message.author?.userid || !message.target) return;
	if (message.author.userid === message.parent.status.userid) return;
	if (message.type === 'pm') {
		// Handle page requests
		if (message.content.startsWith('|requestpage|')) {
			const $T = i18n(getLanguage(message.target));
			const [_, _requestPage, _user, pageId] = message.content.lazySplit('|', 3);
			const SCRABBLEDEX_PAGE = 'scrabbledex';
			if (pageId === SCRABBLEDEX_PAGE) {
				if (!IS_ENABLED.DB) throw new ChatError($T('DISABLED.DB'));
				getScrabbleDex().then(entries => {
					message.author.pageHTML(renderScrabbleDexLeaderboard(entries!, $T), { name: SCRABBLEDEX_PAGE });
				});
				return;
			}

			return;
		}
		if (message.content.startsWith('|closepage|')) {
			const match = message.content.match(/^\|closepage\|(?<user>.*?)\|(?<pageId>\w+)$/);
			if (!match) return message.reply('...hmm hmm hmmmmmmmm very sus');
			if (toId(match.groups!.user) !== message.author.id) return message.reply('Wow I see how it is');
			const pageId = match.groups!.pageId;
			const gameId = `#${pageId.toUpperCase()}`;
			const singlePlayerGameId = `#${pageId.slice(0, 2)}-${pageId.slice(2)}`;

			// Check if there's any relevant games
			const game = Object.values(PSGames)
				.flatMap(gamesList => Object.values(gamesList))
				.find(checkGame => checkGame.id === gameId || checkGame.id === singlePlayerGameId);
			if (!game) return; // Don't put any errors here! People should be able to close games that don't exist, like ones that ended

			const user = message.author.id;
			const player = Object.values(game.players).find(player => player.id === user);
			if (game.hasPlayer(user) && player && !player.out) {
				message.reply(game.$T('GAME.CANNOT_LEAVE', { prefix, game: game.meta.id }));
				return game.update(user);
			}
			if (game.spectators.includes(user)) {
				game.spectators.remove(user);
				message.reply(
					game.$T('GAME.NO_LONGER_WATCHING', {
						game: game.meta.name,
						players: Object.values(game.players)
							.map(player => player.name)
							.list(game.$T),
					})
				);
			}

			return;
		}

		/* Challenges and battle-related handlers */

		/* Invites and related handlers */
	}
}
