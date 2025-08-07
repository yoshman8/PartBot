import { parseMod } from '@/ps/games/mods';
import { checkWord } from '@/ps/games/scrabble/checker';
import { ScrabbleMods } from '@/ps/games/scrabble/constants';
import { ScrabbleModData } from '@/ps/games/scrabble/mods';
import { TOKEN_TYPE, VIEW_ACTION_TYPE } from '@/ps/games/splendor/constants';
import metadata from '@/ps/games/splendor/metadata.json';
import { render } from '@/ps/games/splendor/render';
import { toId } from '@/tools';
import { ChatError } from '@/utils/chatError';

import type { RenderCtx } from '@/ps/games/splendor/types';
import type { PSCommand } from '@/types/chat';

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
		name: 'splendortest',
		help: 'Testing command for Splendor',
		syntax: 'CMD',
		flags: { conceal: true },
		categories: ['game'],
		async run({ message }) {
			const MOCK_RENDER_CTX: RenderCtx = {
				id: '#TEMP',
				header: 'Your turn!',
				board: {
					cards: {
						'1': {
							wild: Object.values(metadata.pokemon)
								.filter(mon => mon.tier === 1)
								.sample(4, 1),
							deck: [],
						},
						'2': {
							wild: Object.values(metadata.pokemon)
								.filter(mon => mon.tier === 2)
								.sample(4, 2),
							deck: [metadata.pokemon.celebi],
						},
						'3': {
							wild: Object.values(metadata.pokemon)
								.filter(mon => mon.tier === 3)
								.sample(4, 6),
							deck: [metadata.pokemon.celebi, metadata.pokemon.eevee],
						},
					},
					trainers: Object.values(metadata.trainers).sample(5, 1),
					tokens: {
						[TOKEN_TYPE.FIRE]: 4,
						[TOKEN_TYPE.GRASS]: 5,
						[TOKEN_TYPE.DARK]: 7,
						[TOKEN_TYPE.DRAGON]: 1,
						[TOKEN_TYPE.WATER]: 0,
						[TOKEN_TYPE.COLORLESS]: 2,
					},
				},
				view: {
					type: 'player',
					active: true,
					self: 'partman',
					action: VIEW_ACTION_TYPE.NONE,
				},
				turns: ['partbot', 'partman'],
				players: {
					partbot: {
						id: 'partbot',
						name: 'PartBot',
						points: 9,
						tokens: {
							[TOKEN_TYPE.FIRE]: 0,
							[TOKEN_TYPE.GRASS]: 0,
							[TOKEN_TYPE.DARK]: 0,
							[TOKEN_TYPE.DRAGON]: 1,
							[TOKEN_TYPE.WATER]: 3,
							[TOKEN_TYPE.COLORLESS]: 0,
						},
						cards: [metadata.pokemon.murkrow, metadata.pokemon.tapulele],
						trainers: [metadata.trainers.larry, metadata.trainers.siebold],
						reserved: [metadata.pokemon.klink],
					},
					partman: {
						id: 'partman',
						name: 'PartMan',
						points: 10,
						tokens: {
							[TOKEN_TYPE.FIRE]: 0,
							[TOKEN_TYPE.GRASS]: 0,
							[TOKEN_TYPE.DARK]: 0,
							[TOKEN_TYPE.DRAGON]: 1,
							[TOKEN_TYPE.WATER]: 3,
							[TOKEN_TYPE.COLORLESS]: 0,
						},
						cards: [
							metadata.pokemon.murkrow,
							metadata.pokemon.tapulele,
							metadata.pokemon.espeon,
							metadata.pokemon.vulpix,
							metadata.pokemon.marill,
							metadata.pokemon.pichu,
							metadata.pokemon.celebi,
						],
						trainers: [metadata.trainers.larry],
						reserved: [metadata.pokemon.klink],
					},
				},
			};

			message.author.pageHTML(render.bind({ msg: '/msg PartBotter, test' })(MOCK_RENDER_CTX));
		},
	},
];
