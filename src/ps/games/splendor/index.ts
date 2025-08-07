import { BaseGame } from '@/ps/games/game';
import {
	ACTIONS,
	AllTokenTypes,
	MAX_RESERVE_COUNT,
	MAX_TOKEN_COUNT,
	POINTS_TO_WIN,
	TOKEN_TYPE,
	TokenTypes,
	VIEW_ACTION_TYPE,
} from '@/ps/games/splendor/constants';
import metadata from '@/ps/games/splendor/metadata.json';
import { render } from '@/ps/games/splendor/render';
import { toId } from '@/tools';
import { ChatError } from '@/utils/chatError';

import type { ToTranslate, TranslatedText } from '@/i18n/types';
import type { BaseContext } from '@/ps/games/game';
import type { Log } from '@/ps/games/splendor/logs';
import type { Card, PlayerData, RenderCtx, State, TokenCount, Turn, ViewType, WinCtx } from '@/ps/games/splendor/types';
import type { ActionResponse, BaseState, EndType, Player } from '@/ps/games/types';
import type { User } from 'ps-client';

export { meta } from '@/ps/games/splendor/meta';

export class Splendor extends BaseGame<State> {
	log: Log[] = [];
	winCtx?: WinCtx | { type: EndType };

	constructor(ctx: BaseContext) {
		super(ctx);
		super.persist(ctx);

		if (ctx.backup) return;

		const allCards = Object.values(metadata.pokemon);
		this.state.board = {
			tokens: Object.fromEntries(AllTokenTypes.map(tokenType => [tokenType, 0])) as TokenCount,
			cards: {
				'1': { wild: [], deck: allCards.filter(({ tier }) => tier === 1) },
				'2': { wild: [], deck: allCards.filter(({ tier }) => tier === 2) },
				'3': { wild: [], deck: allCards.filter(({ tier }) => tier === 3) },
			},
			trainers: [],
		};
		this.state.actionState = { action: VIEW_ACTION_TYPE.NONE };
		this.state.playerData = {};
	}

	createPlayerData(name: string, input: Partial<PlayerData> = {}): PlayerData {
		return {
			points: 0,
			tokens: Object.fromEntries(AllTokenTypes.map(type => [type, 0])) as TokenCount,
			cards: [],
			reserved: [],
			trainers: [],
			...input,
			id: toId(name),
			name,
		};
	}

	gameCanEnd(): boolean {
		const lastPlayerInRound = this.turns.findLast(turn => !this.players[turn].out);

		return (
			this.turn === lastPlayerInRound &&
			Object.values(this.players)
				.filter(player => !player.out)
				.some(player => this.state.playerData[player.turn].points >= POINTS_TO_WIN)
		);
	}

	onStart(): ActionResponse {
		const playerCount = Object.keys(this.players).length;

		// Set tokens. Tokens at the beginning are given by startCount. Base player count is 2.
		AllTokenTypes.forEach(tokenType => (this.state.board.tokens[tokenType] = metadata.types[tokenType].startCount[playerCount - 2]));
		// Set wild cards
		([1, 2, 3] as const).forEach(tier => {
			const TierCards = this.state.board.cards[tier];
			TierCards.deck.shuffle(this.prng);
			TierCards.wild = TierCards.deck.splice(0, 4);
		});
		// Set trainers
		this.state.board.trainers = Object.values(metadata.trainers).sample(playerCount + 1, this.prng);

		this.state.playerData = Object.fromEntries(
			Object.values(this.players).map(player => [player.id, this.createPlayerData(player.name)])
		);

		return { success: true, data: null };
	}

	onReplacePlayer(turn: BaseState['turn'], withPlayer: User): ActionResponse {
		const newData = this.createPlayerData(withPlayer.name, this.state.playerData[turn]);
		delete this.state.playerData[turn];
		this.state.playerData[withPlayer.id] = newData;
		return { success: true, data: null };
	}

	onLeavePlayer(player: Player): ActionResponse<'end' | null> {
		if (this.started) {
			if (this.gameCanEnd()) return { success: true, data: 'end' };
			else {
				const playerData = this.state.playerData[player.turn];
				playerData.out = true;

				const playerCount = Object.values(this.players).filter(player => !player.out).length as 2 | 3 | 4;

				AllTokenTypes.forEach(tokenType => {
					const meta = metadata.types[tokenType].startCount;
					const reduceTokens = meta[playerCount - 2] - meta[playerCount - 2 - 1];
					this.state.board.tokens[tokenType] += playerData.tokens[tokenType] - reduceTokens;
					playerData.tokens[tokenType] = 0;
					if (this.state.board.tokens[tokenType] < 0) this.state.board.tokens[tokenType] = 0;
				});
			}
		}
		return { success: true, data: null };
	}

	lookupCard(ctx: string): Card | null {
		const id = toId(ctx);
		if (id === 'constructor') return null;
		return metadata.pokemon[id] ?? null;
	}

	findWildCard(ctx: string): ActionResponse<Card> {
		const card = this.lookupCard(ctx);
		if (!card) return { success: false, error: `${ctx} is not a valid card.` as ToTranslate };
		if (
			!Object.values(this.state.board.cards)
				.flatMap(cards => cards.wild)
				.some(wildCard => wildCard.id === card.id)
		)
			return { success: false, error: `Cannot access ${ctx} for the desired action.` as ToTranslate };

		return { success: true, data: card };
	}

	getTokens(tokens: Partial<TokenCount>, playerData: PlayerData): void {
		const bank = this.state.board.tokens;
		(Object.entries(tokens) as [TOKEN_TYPE, number][]).forEach(([tokenType, count]) => {
			if (count > bank[tokenType]) {
				throw new Error(`Tried to get ${count} ${metadata.types[tokenType].name} tokens (bank had ${playerData.tokens[tokenType]})!`);
			}
			bank[tokenType] -= count;
			playerData.tokens[tokenType] += count;
		});
	}
	spendTokens(tokens: Partial<TokenCount>, playerData: PlayerData): void {
		const bank = this.state.board.tokens;
		(Object.entries(tokens) as [TOKEN_TYPE, number][]).forEach(([tokenType, count]) => {
			if (count > playerData.tokens[tokenType]) {
				throw new Error(`Tried to use ${count} ${metadata.types[tokenType].name} tokens (only had ${playerData.tokens[tokenType]})!`);
			}
			bank[tokenType] += count;
			playerData.tokens[tokenType] -= count;
		});
	}

	action(user: User, ctx: string): void {
		if (!this.started) this.throw('GAME.NOT_STARTED');
		if (user.id !== this.players[this.turn!].id) this.throw('GAME.IMPOSTOR_ALERT');
		const player = this.getPlayer(user)!;
		const playerData = this.state.playerData[player.turn];
		const [action, actionCtx] = ctx.lazySplit(' ', 1);

		// VIEW_ACTION_TYPES update the user's state while staying on the same turn. Use 'return'.
		// The exception to this is TOO_MANY_TOKENS, which is deferred from ACTIONS and uses 'break'.
		// ACTIONS are actual actions, and will end the turn and stuff if valid. Use 'break'.
		switch (action) {
			case VIEW_ACTION_TYPE.CLICK_TOKENS: {
				this.state.actionState = { action: VIEW_ACTION_TYPE.CLICK_TOKENS };
				this.update(user.id);
				return;
			}
			case VIEW_ACTION_TYPE.CLICK_RESERVE: {
				const card = this.lookupCard(actionCtx);
				if (!card) throw new ChatError(`${actionCtx} is not available to reserve.` as ToTranslate);

				const canAfford = this.canAfford(card.cost, playerData.tokens);

				this.state.actionState = {
					action: VIEW_ACTION_TYPE.CLICK_RESERVE,
					id: card.id,
					preset: canAfford ? canAfford.recommendation : null,
				};
				this.update(user.id);
				return;
			}
			case VIEW_ACTION_TYPE.CLICK_WILD: {
				const lookupCard = this.findWildCard(actionCtx);
				if (!lookupCard.success) throw new ChatError(`${actionCtx} is not available to buy.` as ToTranslate);

				const card = lookupCard.data;

				const canBuy = this.canAfford(card.cost, playerData.tokens);
				const canReserve = this.canReserve(player);

				if (!canBuy && !canReserve) throw new ChatError(`You can neither buy nor reserve ${card.name}.` as ToTranslate);
				this.state.actionState = {
					action: VIEW_ACTION_TYPE.CLICK_WILD,
					id: card.id,
					...(canBuy ? { canBuy: true, preset: canBuy.recommendation } : { canBuy: false, preset: null }),
					canReserve,
				};
				this.update(user.id);
				return;
			}

			case VIEW_ACTION_TYPE.TOO_MANY_TOKENS: {
				if (this.state.actionState.action !== VIEW_ACTION_TYPE.TOO_MANY_TOKENS)
					throw new ChatError("You don't need to discard any tokens yet." as ToTranslate);
				const toDiscard = this.state.actionState.discard;
				const tokensToDiscard = this.parseTokens(actionCtx);
				const discarding = Object.values(tokensToDiscard).sum();

				if (discarding < toDiscard)
					throw new ChatError(`You must discard at least ${toDiscard} tokens! ${discarding} isn't enough.` as ToTranslate);
				if (!this.canAfford(tokensToDiscard, playerData.tokens))
					throw new ChatError("Unfortunately it doesn't look like you don't have those to discard." as ToTranslate);

				this.spendTokens(tokensToDiscard, playerData);
				break;
			}

			case ACTIONS.BUY: {
				const [mon, tokenInfo = ''] = actionCtx.lazySplit(' ', 1);
				const getCard = this.findWildCard(mon);
				if (!getCard.success) throw new ChatError(getCard.error);
				const card = getCard.data;

				const paying = this.parseTokens(tokenInfo);
				if (!this.canAfford(card.cost, paying))
					throw new ChatError(`The given tokens are insufficient to purchase ${card.name}!` as ToTranslate);

				this.spendTokens(paying, playerData);
				playerData.cards.push(card);
				break;
			}

			case ACTIONS.RESERVE: {
				const getCard = this.findWildCard(actionCtx);
				if (!getCard.success) throw new ChatError(getCard.error);

				if (!this.canReserve(player)) {
					throw new ChatError(
						('You cannot reserve a card.' +
							'You may only reserve a card if a Dragon token is available AND you have less than three cards currently reserved.') as ToTranslate
					);
				}

				playerData.reserved.push(getCard.data);
				this.getTokens({ [TOKEN_TYPE.DRAGON]: 1 }, playerData);
				break;
			}

			case ACTIONS.BUY_RESERVE: {
				const [mon, tokenInfo = ''] = actionCtx.lazySplit(' ', 1);
				const getCard = this.findWildCard(mon);
				if (!getCard.success) throw new ChatError(getCard.error);
				const baseCard = this.lookupCard(mon);
				if (!baseCard) throw new ChatError(`${mon} is not a valid card!` as ToTranslate);
				const reservedCard = playerData.reserved.find(card => card.id === baseCard.id);
				if (!reservedCard) throw new ChatError(`You have not reserved ${baseCard.name}!` as ToTranslate);

				const paying = this.parseTokens(tokenInfo);
				if (!this.canAfford(reservedCard.cost, paying))
					throw new ChatError(`The given tokens are insufficient to purchase ${reservedCard.name}!` as ToTranslate);

				this.spendTokens(paying, playerData);
				playerData.reserved.remove(reservedCard);
				break;
			}

			case ACTIONS.DRAW: {
				const tokens = this.parseTokens(actionCtx);
				const validateTokens = this.getTokenIssues(tokens);
				if (!validateTokens.success) throw new ChatError(validateTokens.error);
				this.getTokens(tokens, playerData);
				break;
			}

			default: {
				throw new ChatError(`Unrecognized action ${action} (${actionCtx})` as ToTranslate);
			}
		}

		playerData.points = playerData.cards.map(card => card.points).sum() + playerData.trainers.map(trainer => trainer.points).sum();

		this.state.actionState = { action: VIEW_ACTION_TYPE.NONE };

		if (this.gameCanEnd()) this.end();
		else if (Object.values(playerData.tokens).sum() > MAX_TOKEN_COUNT) {
			const count = Object.values(playerData.tokens).sum();
			this.state.actionState = { action: VIEW_ACTION_TYPE.TOO_MANY_TOKENS, discard: count - MAX_TOKEN_COUNT };
			this.update(user.id);
		} else this.endTurn();
	}

	canAfford(cost: Partial<TokenCount>, funds: TokenCount): { recommendation: TokenCount } | false {
		const availableDragons = funds[TOKEN_TYPE.DRAGON] - (cost[TOKEN_TYPE.DRAGON] ?? 0);
		if (availableDragons < 0) return false;

		const neededDragons = TokenTypes.filterMap(type => {
			const needed = cost[type];
			if (needed && needed > funds[type]) return needed - funds[type];
		}).sum();

		if (neededDragons > availableDragons) return false;
		return {
			recommendation: {
				...Object.fromEntries(TokenTypes.map(type => [type, Math.min(cost[type] ?? Infinity, funds[type])])),
				[TOKEN_TYPE.DRAGON]: neededDragons,
			} as TokenCount,
		};
	}

	canReserve(player: Player): boolean {
		return this.state.playerData[player.turn].reserved.length < MAX_RESERVE_COUNT && this.state.board.tokens[TOKEN_TYPE.DRAGON] > 0;
	}

	/**
	 * @example this.parseTokens('C1DF0w5G'); // { colorless: 1, water: 5, ... }
	 */
	parseTokens(input: string): TokenCount {
		const tokenNames: Record<string, TOKEN_TYPE> = {
			C: TOKEN_TYPE.COLORLESS,
			D: TOKEN_TYPE.DARK,
			F: TOKEN_TYPE.FIRE,
			G: TOKEN_TYPE.GRASS,
			W: TOKEN_TYPE.WATER,
		};
		const tokens = Object.fromEntries(AllTokenTypes.map(type => [type, 0])) as TokenCount;
		input.split(/(?=[a-z])/i).forEach(entry => {
			const char = entry[0].toUpperCase();
			const amt = +entry.substring(1);
			if (!(amt >= 0 && amt < 10)) throw new ChatError(`${entry.substring(1)} is not a valid count.` as ToTranslate);
			const type = tokenNames[char];
			if (!type) throw new ChatError(`${char} is not a recognized type id.` as ToTranslate);
			tokens[tokenNames[char]] += amt;
		});
		return tokens;
	}

	getTokenIssues(tokens: TokenCount): ActionResponse {
		const input = (Object.entries(tokens) as [TOKEN_TYPE, number][]).filterMap(([type, count]) => {
			if (count > 0) return { type, count, available: this.state.board.tokens[type], name: metadata.types[type].name };
		});

		if (tokens[TOKEN_TYPE.DRAGON])
			return { success: false, error: 'You may only obtain Dragon tokens by reserving cards!' as ToTranslate };

		const tooMany = input.filter(({ count, available }) => count > available);
		if (tooMany.length > 0) {
			const extraInfo = ` (${tooMany.map(({ count, available, name }) => `${count} from ${name} (${available})`).list(this.$T)})`;
			return {
				success: false,
				error: `Tried to take more tokens than available!${extraInfo}` as ToTranslate,
			};
		}

		if (input.length > 3) return { success: false, error: "You can't take that many tokens!" as ToTranslate };
		if (input.length === 0) return { success: false, error: 'You must take at least 2 tokens!' as ToTranslate };
		if (input.length === 2) {
			return { success: false, error: 'You can only take 2 from 1 type or 1 each from 3 types!' as ToTranslate };
		}

		if (input.length === 1) {
			const { count, name, available } = input[0];
			if (count !== 2) return { success: false, error: 'When taking from one stack you can only take exactly 2.' as ToTranslate };
			if (available < 4)
				return {
					success: false,
					error: `You can only take 2 tokens if the stack has 4 or more. ${name} only had ${available}.` as ToTranslate,
				};
		}

		if (input.length === 3) {
			const moreThanOne = input.filter(({ count }) => count !== 1);
			if (moreThanOne.length > 0) {
				const extraInfo = ` Tried to take ${moreThanOne.map(({ count, name }) => `${count} from ${name}`).list(this.$T)}`;
				return {
					success: false,
					error: `You can only take 1 token from each of the 3 types!${extraInfo}` as ToTranslate,
				};
			}
		}

		return { success: true, data: null };
	}

	onEnd(type?: EndType): TranslatedText {
		if (type) {
			this.winCtx = { type };
			if (type === 'dq') return this.$T('GAME.ENDED_AUTOMATICALLY', { game: this.meta.name, id: this.id });
			return this.$T('GAME.ENDED', { game: this.meta.name, id: this.id });
		}
		// const scores = this.count();
		// if (scores.W === scores.B) {
		// 	this.winCtx = { type: 'draw' };
		// 	return this.$T('GAME.DRAW', { players: [this.players.W.name, this.players.B.name].list(this.$T) });
		// }
		// const winningSide = scores.W > scores.B ? 'W' : 'B';
		// const winner = this.players[winningSide];
		// const loser = this.players[this.getNext(winningSide)];
		// this.winCtx = {
		// 	type: 'win',
		// 	winner: { ...winner, score: scores[winningSide] },
		// 	loser: { ...loser, score: scores[this.getNext(winningSide)] },
		// };
		// return this.$T('GAME.WON_AGAINST', {
		// 	winner: `${winner.name} (${winningSide})`,
		// 	game: this.meta.name,
		// 	loser: `${loser.name} (${this.getNext(winningSide)})`,
		// 	ctx: ` [${scores[winningSide]}-${scores[this.getNext(winningSide)]}]`,
		// });
		return 'TODO' as ToTranslate;
	}

	render(side: Turn | null) {
		let view: ViewType;
		if (side) {
			if (side === this.turn) view = { type: 'player', active: true, self: side, ...this.state.actionState };
			else view = { type: 'player', active: false };
		} else view = { type: 'spectator', active: false };

		const ctx: RenderCtx = { id: this.id, board: this.state.board, players: this.state.playerData, turns: this.turns, view };

		if (this.winCtx) {
			ctx.header = this.$T('GAME.GAME_ENDED');
		} else if (side === this.turn) {
			ctx.header = this.$T('GAME.YOUR_TURN');
		} else if (side) {
			ctx.header = this.$T('GAME.WAITING_FOR_OPPONENT');
			ctx.dimHeader = true;
		} else if (this.turn) {
			const current = this.players[this.turn];
			ctx.header = this.$T('GAME.WAITING_FOR_PLAYER', { player: `${current.name}${this.sides ? ` (${this.turn})` : ''}` });
		}
		return render.bind(this.renderCtx)(ctx);
	}
}
