import { Temporal } from '@js-temporal/polyfill';

import { TimeZone } from '@/ps/handlers/cron/constants';
import { UGO_2025_END, UGO_2025_START } from '@/ps/ugo/constants';
import { instantInRange } from '@/utils/timeInRange';

export function isUGOActive(): boolean {
	const now = Temporal.Now.zonedDateTimeISO(TimeZone.GMT);
	return instantInRange(now, [UGO_2025_START, UGO_2025_END]);
}
