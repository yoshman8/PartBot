import { IS_ENABLED } from '@/enabled';
import Sentinel from '@/sentinel';

import type { Register } from '@/sentinel/types';

export const WEB_REGISTERS: Register[] = IS_ENABLED.WEB
	? [
			{
				label: 'routes',
				pattern: /\/web/,
				reload: async () => {
					await Sentinel.hotpatch('web', Symbol.for('Sentinel'));
				},
			},
		]
	: [];
