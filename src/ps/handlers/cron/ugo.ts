import { resetUGOPlayed } from '@/cache/ugo';
import { TimeZone } from '@/ps/handlers/cron/constants';

import type { PSCronJobManager } from '@/ps/handlers/cron/index';
import type { Client } from 'ps-client';

// UGO-CODE
export function register(this: Client, Jobs: PSCronJobManager): void {
	Jobs.register('ugo-daily-reset', '0 0 * * *', TimeZone.GMT, () => {
		resetUGOPlayed().then(backupUrl => {
			this.getRoom('Board Games').send(`/modnote Reset player participation counts for the day! Backup: ${backupUrl}`);
		});
	});
}
