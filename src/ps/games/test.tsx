import { cachebustDir } from '@/utils/cachebust';
import { fsPath } from '@/utils/fsPath';
import { jsxToHTML } from '@/utils/jsxToHTML';

import type { Metadata } from '@/ps/games/splendor/types';

export const test: () => Promise<string> = async () => {
	try {
		cachebustDir(fsPath('ps', 'games'));
		const { Card } = await import('@/ps/games/splendor/render');
		const { default: metadata } = (await import('@/ps/games/splendor/metadata.json')) as unknown as { default: Metadata };
		return jsxToHTML(
			<div>
				<Card data={metadata.pokemon.chiyu} />
				<Card data={metadata.pokemon.eevee} />
			</div>
		);
	} catch (err) {
		return err instanceof Error ? err.message : 'Something went wrong!';
	}
};
