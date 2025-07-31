import type { ShipType } from '@/ps/games/battleship/constants';
import type { Player } from '@/ps/games/types';

export type Turn = 'A' | 'B';

export type ShipBoard = (ShipType | null)[][];
export type AttackBoard = (ShipType | false | null)[][];
export type Boards = { ships: Record<Turn, ShipBoard>; attacks: Record<Turn, AttackBoard> };

export type SelectionInProgressState = { type: 'valid'; board: ShipBoard; input: string[] };
export type SelectionErrorState = { type: 'invalid'; input: string[]; message: string };

export type State = {
	turn: Turn;
	// object only when previewing ships but not ready yet
	ready: Record<Turn, boolean | SelectionInProgressState | SelectionErrorState>;
	allReady?: boolean;
	board: Boards;
};

export type RenderCtx = {
	id: string;
	header?: string;
	dimHeader?: boolean;
} & (
	| { type: 'player'; attack: AttackBoard; defense: AttackBoard; actual: ShipBoard; active: boolean }
	| { type: 'spectator'; boards: Boards['attacks']; players: Record<Turn, Player>; active?: false }
);
export type WinCtx = { type: 'win' } & Record<'winner' | 'loser', Player>;
