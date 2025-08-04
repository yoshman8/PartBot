export type Turn = 'W' | 'B';

export enum TokenType {
	Colorless = 'colorless',
	Dark = 'dark',
	Fire = 'fire',
	Grass = 'grass',
	Water = 'water',
	Dragon = 'dragon',
}

export type Card = {
	id: string;
	name: string;
	tier: number;
	type: TokenType;
	points: number;
	cost: Partial<Record<TokenType, number>>;
	art: string;
};

export type Deck = Card[];
export type WildCards = (Card | null)[];

export type Trainer = {
	id: string;
	name: string;
	points: number;
	types: Partial<Record<TokenType, number>>;
	art: string;
};

export type Board = {
	cards: Record<1 | 2 | 3, { wild: WildCards; deck: Deck }>;
	trainers: Trainer[];
	tokens: Record<TokenType, number>;
};

export type PlayerData = {
	points: number;
	tokens: Record<TokenType, number>;
	cards: Card[];
	reserved: Card[];
	trainers: Trainer[];
};

export type State = {
	turn: Turn;
	board: Board;
	playerData: PlayerData;
};

export type RenderCtx = {
	id: string;
	board: Board;
	validMoves: [number, number][];
	header?: string;
	dimHeader?: boolean;
	self?: PlayerData;
	players: Record<string, PlayerData>;
};

export type WinCtx =
	| ({ type: 'win' } & Record<'winner' | 'loser', { name: string; id: string; turn: string; score: number }>)
	| { type: 'draw' };
