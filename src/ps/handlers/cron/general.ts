import { gameCache } from '@/cache/games';
import { TimeZone } from '@/ps/handlers/cron/constants';

import type { PSCronJobManager } from '@/ps/handlers/cron/index';
import type { Client } from 'ps-client';

export function register(this: Client, Jobs: PSCronJobManager): void {
	Jobs.register('clear-old-games', '0 0 * * *', TimeZone.GMT, () => {
		gameCache.clearOldBackups();
	});
}
