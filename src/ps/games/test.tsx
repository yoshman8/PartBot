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
			.sample(4);
		const tier2 = Object.values(metadata.pokemon)
			.filter(mon => mon.tier === 2)
			.sample(4);
		const tier3 = Object.values(metadata.pokemon)
			.filter(mon => mon.tier === 3)
			.sample(4);

		return jsxToHTML(
			<div style={{ zoom: '50%' }}>
				<div>
					<TrainerCard data={metadata.trainers.larry} />
					<TrainerCard data={metadata.trainers.cheryl} />
					<TrainerCard data={metadata.trainers.drasna} />
				</div>
				<div>
					<TypeTokenCount type={TokenType.Colorless} count={2} />
					<TypeTokenCount type={TokenType.Dark} count={2} />
					<TypeTokenCount type={TokenType.Fire} count={2} />
					<TypeTokenCount type={TokenType.Grass} count={2} />
					<TypeTokenCount type={TokenType.Water} count={2} />
					<TypeTokenCount type={TokenType.Dragon} count={2} />
				</div>
				{[tier1, tier2, tier3].map(cards => (
					<div style={{ whiteSpace: 'nowrap', overflow: 'auto' }}>
						{cards.map(card => (
							<Stack cards={[card]} />
						))}
						<Stack cards={[]} hidden />
					</div>
				))}
			</div>
		);
	} catch (err) {
		return err instanceof Error ? err.message : 'Something went wrong!';
	}
};
