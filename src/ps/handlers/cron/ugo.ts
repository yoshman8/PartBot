import { resetUGOPlayed } from '@/cache/ugo';
import Discord from '@/discord';
import { TimeZone } from '@/ps/handlers/cron/constants';
import getSecretFunction from '@/secrets/functions';

import type { PSCronJobManager } from '@/ps/handlers/cron/index';
import type { Client as DiscordClient } from 'discord.js';
import type { Client } from 'ps-client';

// UGO-CODE
export function register(this: Client, Jobs: PSCronJobManager): void {
	Jobs.register('ugo-daily-reset', '0 0 * * *', TimeZone.GMT, () => {
		resetUGOPlayed().then(backupUrl => {
			this.getRoom('Board Games').send(`/modnote Reset player participation counts for the day! Backup: ${backupUrl}`);
		});
	});
	// August 29, 22:00 GMT
	Jobs.register('hunt-swap-ping', '0 22 29 08 *', TimeZone.GMT, () => {
		getSecretFunction<(client: DiscordClient) => Promise<void>>('pingForHuntSwap', async () => {})(Discord)
			.then(() => {
				this.getRoom('Scavengers').send('/modnote Pinged for hunt swap. I think. Probably. I hope.');
			})
			.catch(() => {
				this.getRoom('Scavengers').send('/modnote Unable to ping for hunt swap! Tag PartMan!');
			});
	});
}
