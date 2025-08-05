import '@/globals';

import { TokenType } from '@/ps/games/splendor/types';
import { cachebustDir } from '@/utils/cachebust';
import { fsPath } from '@/utils/fsPath';
import { jsxToHTML } from '@/utils/jsxToHTML';

import type { Metadata } from '@/ps/games/splendor/types';

export const test: () => Promise<string> = async () => {
	try {
		cachebustDir(fsPath('ps', 'games'));
		const { Stack, TypeTokenCount, TrainerCard } = await import('@/ps/games/splendor/render');
		const { default: metadata } = (await import('@/ps/games/splendor/metadata.json')) as unknown as { default: Metadata };

		const tier1 = Object.values(metadata.pokemon)
			.filter(mon => mon.tier === 1)
			.sample(4, 1);
		const tier2 = Object.values(metadata.pokemon)
			.filter(mon => mon.tier === 2)
			.sample(4, 2);
		const tier3 = Object.values(metadata.pokemon)
			.filter(mon => mon.tier === 3)
			.sample(4, 2);

		return jsxToHTML(
			<div style={{ zoom: '50%' }}>
				<div>
					<TrainerCard data={metadata.trainers.larry} />
					<TrainerCard data={metadata.trainers.cheryl} />
					<TrainerCard data={metadata.trainers.drasna} />
				</div>
				<div>
					<TypeTokenCount type={TokenType.Dragon} count={2} />
					<TypeTokenCount type={TokenType.Colorless} count={2} />
					<TypeTokenCount type={TokenType.Dark} count={2} />
					<TypeTokenCount type={TokenType.Fire} count={2} />
					<TypeTokenCount type={TokenType.Grass} count={2} />
					<TypeTokenCount type={TokenType.Water} count={2} />
				</div>
				{[tier3, tier2, tier1].map((cards, tier) => (
					<div style={{ whiteSpace: 'nowrap', overflow: 'auto' }}>
						{cards.map(card => (
							<Stack cards={[card]} />
						))}
						<Stack cards={tier < 2 ? [metadata.pokemon.celebi] : []} hidden={!!tier} reserved={!tier} />
					</div>
				))}
			</div>
		);
	} catch (err) {
		return err instanceof Error ? err.message : 'Something went wrong!';
	}
};
