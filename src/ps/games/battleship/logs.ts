import type { Turn } from '@/ps/games/battleship/types';
import type { BaseLog, CommonLog } from '@/ps/games/types';
import type { Satisfies, SerializedInstance } from '@/types/common';

export type Log = Satisfies<
	BaseLog,
	{
		time: Date;
		turn: Turn;
	} & (
		| { action: 'hit'; ctx: { ship: string; point: string } }
		| { action: 'miss'; ctx: { point: string } }
		| { action: 'set'; ctx: string[] }
	)
>;

export type APILog = SerializedInstance<Log | CommonLog>;
