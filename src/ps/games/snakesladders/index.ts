import { BaseGame } from '@/ps/games/game';
import { render } from '@/ps/games/snakesladders/render';
import { sample } from '@/utils/random';
import { range } from '@/utils/range';

import type { ToTranslate, TranslatedText } from '@/i18n/types';
import type { BaseContext } from '@/ps/games/game';
import type { Log } from '@/ps/games/snakesladders/logs';
import type { RenderCtx, State, WinCtx } from '@/ps/games/snakesladders/types';
import type { ActionResponse, EndType } from '@/ps/games/types';
import type { User } from 'ps-client';
import type { ReactNode } from 'react';

export { meta } from '@/ps/games/snakesladders/meta';

export class SnakesLadders extends BaseGame<State> {
	log: Log[] = [];
	winCtx?: WinCtx | { type: EndType };
	frames: ReactNode[] = [];

	ladders: [number, number][] = [
		[1, 38],
		[4, 14],
		[8, 30],
		[21, 42],
		[28, 76],
		[50, 67],
		[71, 92],
		[80, 99],
	];
	snakes: [number, number][] = [
		[32, 10],
		[36, 6],
		[48, 26],
		[62, 18],
		[88, 24],
		[95, 56],
		[97, 78],
	];

	constructor(ctx: BaseContext) {
		super(ctx);
		super.persist(ctx);

		if (ctx.backup) return;
		this.state.board = {};
		this.state.lastRoll = 0;
	}

	onStart(): ActionResponse {
		const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9e00ff', '#ff00ff'].shuffle();
		Object.values(this.players).forEach(
			player => (this.state.board[player.id] = { pos: 0, name: player.name, color: colors.shift()! })
		);
		return { success: true, data: null };
	}

	action(user: User): void {
		if (!this.started) this.throw('GAME.NOT_STARTED');
		if (user.id !== this.players[this.turn!].id) this.throw('GAME.IMPOSTOR_ALERT');
		this.roll();
	}

	roll(): void {
		const player = this.turn!;
		const current = this.state.board[player].pos;
		const dice = 1 + sample(6, this.prng);
		this.state.lastRoll = dice;
		if (current + dice > 100) {
			this.room.privateSend(
				player,
				`You rolled a ${dice}, but needed a ${100 - current}${100 - current === 1 ? '' : ' or lower'}...` as ToTranslate
			);
			this.nextPlayer();
			return;
		}

		let final = current + dice;
		const frameNums = range(current, final, dice + 1);
		const onSnekHead = this.snakes.find(snek => snek[0] === final);
		if (onSnekHead) {
			final = onSnekHead[1];
			frameNums.push(final);
		}
		const onLadderFoot = this.ladders.find(ladder => ladder[0] === final);
		if (onLadderFoot) {
			final = onLadderFoot[1];
			frameNums.push(final);
		}
		this.state.board[player].pos = final;

		this.log.push({ turn: player, time: new Date(), action: 'roll', ctx: dice });

		if (final === 100) {
			this.winCtx = { type: 'win', winner: { ...this.players[current], board: this.state.board } };
			this.end();
			return;
		}

		this.frames = frameNums.map(pos => this.render(null, pos));

		this.nextPlayer();
	}

	update(user?: string): void {
		if (this.frames.length > 0) {
			if (user) return; // Don't send the page if animating
			this.room.pageHTML(
				[
					...Object.values(this.players)
						.filter(player => !player.out)
						.map(player => player.id),
					...this.spectators,
				],
				this.frames.shift(),
				{ name: this.id }
			);
			if (this.frames.length > 0) setTimeout(() => this.update(), 500);
			else setTimeout(() => super.update(), 500);
			return;
		} else super.update(user);
	}

	onEnd(type?: EndType): TranslatedText {
		if (type) {
			this.winCtx = { type };
			if (type === 'dq') return this.$T('GAME.ENDED_AUTOMATICALLY', { game: this.meta.name, id: this.id });
			return this.$T('GAME.ENDED', { game: this.meta.name, id: this.id });
		}
		return this.$T('GAME.WON', { winner: this.turn! });
	}

	render(side: string | null, override?: number) {
		const ctx: RenderCtx = {
			board:
				override && this.turn
					? { ...this.state.board, [this.turn]: { ...this.state.board[this.turn], pos: override } }
					: this.state.board,
			lastRoll: this.state.lastRoll,
			id: this.id,
			active: side === this.turn && !!side,
		};
		if (this.winCtx) {
			ctx.header = this.$T('GAME.GAME_ENDED');
		} else if (typeof override === 'number') {
			ctx.header = `${this.turn} rolled a ${this.state.lastRoll}...`;
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
