import '@/globals';

import { TokenType } from '@/ps/games/splendor/types';
import { ansiToHtml } from '@/utils/ansiToHtml';
import { cachebustDir } from '@/utils/cachebust';
import { fsPath } from '@/utils/fsPath';
import { jsxToHTML } from '@/utils/jsxToHTML';

import type { Board, Metadata } from '@/ps/games/splendor/types';

export const test: () => Promise<string> = async () => {
	try {
		cachebustDir(fsPath('ps', 'games'));
		const { PlayerSummary, ActivePlayer, BaseBoard } = await import('@/ps/games/splendor/render');
		const { default: metadata } = (await import('@/ps/games/splendor/metadata.json')) as unknown as { default: Metadata };

		const MOCK_BOARD: Board = {
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
				[TokenType.Fire]: 4,
				[TokenType.Grass]: 5,
				[TokenType.Dark]: 7,
				[TokenType.Dragon]: 1,
				[TokenType.Water]: 0,
				[TokenType.Colorless]: 2,
			},
		};

		return jsxToHTML(
			<div style={{ zoom: '50%' }}>
				<BaseBoard board={MOCK_BOARD} />
				<hr />
				<ActivePlayer
					data={{
						id: 'partman',
						name: 'PartMan',
						points: 10,
						tokens: {
							[TokenType.Fire]: 0,
							[TokenType.Grass]: 0,
							[TokenType.Dark]: 0,
							[TokenType.Dragon]: 1,
							[TokenType.Water]: 3,
							[TokenType.Colorless]: 0,
						},
						cards: [metadata.pokemon.murkrow, metadata.pokemon.tapulele, metadata.pokemon.espeon, metadata.pokemon.vulpix],
						trainers: [metadata.trainers.larry],
						reserved: [metadata.pokemon.klink],
					}}
					onClick={'test'}
				/>
				<hr />
				<PlayerSummary
					data={{
						id: 'partbot',
						name: 'PartBot',
						points: 9,
						tokens: {
							[TokenType.Fire]: 0,
							[TokenType.Grass]: 0,
							[TokenType.Dark]: 0,
							[TokenType.Dragon]: 1,
							[TokenType.Water]: 3,
							[TokenType.Colorless]: 0,
						},
						cards: [metadata.pokemon.murkrow, metadata.pokemon.tapulele],
						trainers: [metadata.trainers.larry, metadata.trainers.siebold],
						reserved: [metadata.pokemon.klink],
					}}
				/>
			</div>
		);
	} catch (err) {
		return err instanceof Error ? ansiToHtml(err.message) : 'Something went wrong!';
	}
};
