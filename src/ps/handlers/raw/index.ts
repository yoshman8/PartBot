import { checkHunts, onEndHunt } from '@/ps/handlers/raw/scavengers';

import type { Client } from 'ps-client';

export function rawHandler(this: Client, room: string, data: string, isIntro: boolean): void {
	if (isIntro) return;
	// Hunts
	checkHunts(room, data);
	onEndHunt.call(this, room, data);
}
