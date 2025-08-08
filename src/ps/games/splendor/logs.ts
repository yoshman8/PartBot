import type { ACTIONS, VIEW_ACTION_TYPE } from '@/ps/games/splendor/constants';
import type { TokenCount, Turn } from '@/ps/games/splendor/types';
import type { BaseLog } from '@/ps/games/types';
import type { Satisfies, SerializedInstance } from '@/types/common';

export type Log = Satisfies<
	BaseLog,
	{
		time: Date;
		turn: Turn;
	} & (
		| {
				action: ACTIONS.BUY;
				ctx: { id: string; cost: Partial<TokenCount>; trainers?: string[] };
		  }
		| {
				action: ACTIONS.BUY_RESERVE;
				ctx: { id: string; cost: Partial<TokenCount>; trainers?: string[] };
		  }
		| {
				action: ACTIONS.RESERVE;
				ctx: { id: string; trainers?: string[] };
		  }
		| {
				action: ACTIONS.DRAW;
				ctx: { tokens: Partial<TokenCount>; trainers?: string[] };
		  }
		| {
				action: VIEW_ACTION_TYPE.TOO_MANY_TOKENS;
				ctx: { discard: Partial<TokenCount>; trainers?: string[] };
		  }
		| { action: 'pass'; ctx: null }
	)
>;

export type APILog = SerializedInstance<Log>;
