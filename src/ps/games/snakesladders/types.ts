export type Board = Record<string, { pos: number; color: string; name: string }>;

export type State = {
	turn: string;
	board: Board;
	lastRoll: number;
};

export type RenderCtx = {
	id: string;
	board: Board;
	lastRoll: number;
	active?: boolean;
	header?: string;
	dimHeader?: boolean;
};
export type WinCtx = { type: 'win'; winner: { name: string; id: string; turn: string; board: Board } };
