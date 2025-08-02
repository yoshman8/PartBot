import { SHIP_DATA, Ships } from '@/ps/games/battleship/constants';
import { type CellRenderer, Table } from '@/ps/games/render';
import { createGrid } from '@/ps/games/utils';
import { Username } from '@/utils/components';
import { Button, Form } from '@/utils/components/ps';
import { pointToA1 } from '@/utils/grid';
import { Logger } from '@/utils/logger';

import type { ToTranslate } from '@/i18n/types';
import type { ShipType } from '@/ps/games/battleship/constants';
import type { Battleship } from '@/ps/games/battleship/index';
import type { Log } from '@/ps/games/battleship/logs';
import type {
	AttackBoard,
	RenderCtx,
	SelectionErrorState,
	SelectionInProgressState,
	ShipBoard,
	State,
	Turn,
	WinCtx,
} from '@/ps/games/battleship/types';
import type { EndType, Player } from '@/ps/games/types';
import type { ReactElement, ReactNode } from 'react';

const EMPTY_BOARD: null[][] = createGrid(10, 10, () => null);

export function renderMove(logEntry: Log, { id, players, $T, renderCtx: { msg } }: Battleship): [ReactElement, { name: string }] {
	const Wrapper = ({ children }: { children: ReactNode }): ReactElement => (
		<>
			<hr />
			{children}
			<Button name="send" value={`${msg} watch`} style={{ float: 'right' }}>
				{$T('GAME.LABELS.WATCH')}
			</Button>
			<hr />
		</>
	);

	const playerName = players[logEntry.turn]?.name;
	const opts = { name: `${id}-chatlog` };

	switch (logEntry.action) {
		case 'set':
			return [
				<Wrapper>
					<Username name={playerName} clickable /> set their ships!
				</Wrapper>,
				opts,
			];
		case 'hit':
			return [
				<Wrapper>
					<Username name={playerName} clickable /> hit the enemy {logEntry.ctx.ship}!
				</Wrapper>,
				opts,
			];
		case 'miss':
			return [
				<Wrapper>
					<Username name={playerName} clickable /> missed.
				</Wrapper>,
				opts,
			];
		default:
			Logger.log('Battleship had some weird move', logEntry, players);
			return [
				<Wrapper>
					Well <i>something</i> happened, I think! Someone go poke PartMan
				</Wrapper>,
				opts,
			];
	}
}

function ShipGrid({
	boards,
	clickable,
	msg,
}: {
	boards: AttackBoard | { defense: AttackBoard; ships: ShipBoard };
	clickable?: boolean;
	msg?: string;
}): ReactElement {
	const showHitsAsShips = clickable;
	const missiles = !Array.isArray(boards) ? boards.defense : boards;
	const ships = !Array.isArray(boards) ? boards.ships : EMPTY_BOARD;

	const Cell: CellRenderer<ShipType | null> = ({ cell: ship, i, j }) => {
		const hitData = missiles.access([i, j]);
		const shipData = ship ?? hitData;
		const isHit = hitData === false ? false : hitData ? true : null;

		return (
			<td
				style={{
					lineHeight: 0,
					textAlign: 'center',
					fontWeight: 'bold',
					height: 20,
					width: 20,
					background: shipData ? '#555' : '#01AAD6',
					color: isHit ? 'red' : undefined,
					...(!shipData ? { border: '1px solid white' } : {}),
				}}
			>
				{typeof isHit === 'boolean' && !(showHitsAsShips && isHit) ? (
					<div style={{ background: isHit ? 'red' : 'white', borderRadius: 9, width: 13, height: 13, marginLeft: 4 }}>
						<div
							style={{
								background: 'black',
								opacity: 0.4,
								borderRadius: 5,
								width: 7,
								height: 7,
								left: 3,
								top: 3,
								position: 'relative',
							}}
						/>
					</div>
				) : shipData ? (
					SHIP_DATA[shipData].symbol
				) : clickable ? (
					<Button
						value={`${msg} ! hit ${pointToA1([i, j])}`}
						style={{ border: 'none', background: 'none', height: 23, width: 23, margin: 0 }}
					/>
				) : null}
			</td>
		);
	};

	return <Table board={ships} labels={{ row: 'A-Z', col: '1-9' }} Cell={Cell} style={{ fontSize: '0.8em' }} />;
}

function ShipInput({ msg, filled }: { msg: string; filled?: string[] | null }): ReactElement {
	const cloned = filled?.slice();
	return (
		<Form
			value={`${msg} ! set ${Ships.map(ship => ship.symbol)
				.map(s => `{${s}1}-{${s}2}`)
				.join('|')}`}
		>
			{Ships.map((ship, index) => {
				const row = (index + 1).toLetter();
				return (
					<div>
						<b style={{ width: 100, display: 'inline-block', textAlign: 'right' }}>{ship.name}</b>
						{': '}
						<input name={`${ship.symbol}1`} style={{ width: 40 }} placeholder={`${row}1`} value={cloned?.shift() ?? ''} />
						{' - '}
						<input name={`${ship.symbol}2`} style={{ width: 40 }} placeholder={`${row}${ship.size}`} value={cloned?.shift() ?? ''} />
					</div>
				);
			})}
			<br />
			<center>
				<button>Go!</button>
			</center>
		</Form>
	);
}

export function renderSelection(
	this: { msg: string },
	ctx?: SelectionInProgressState | SelectionErrorState | null,
	locked?: boolean
): ReactElement {
	const input = ctx?.type ? ctx.input : null;
	const error = ctx?.type === 'invalid' ? ctx?.message : null;

	return (
		<center>
			<div>
				<h1 style={locked ? { color: 'gray' } : {}}>
					{locked ? ('Waiting for opponent to set their ships...' as ToTranslate) : ('Set your ships!' as ToTranslate)}
				</h1>
				<ShipGrid boards={ctx?.type === 'valid' ? { defense: EMPTY_BOARD, ships: ctx.board } : EMPTY_BOARD} />
				{error ? <h3>{error}</h3> : null}
				{!locked ? (
					<>
						{input ? (
							<>
								<Button value={`${this.msg} ! confirm-set`}>Confirm</Button>
								<br />
								<details style={{ textAlign: 'left', width: 300 }}>
									<summary>Input</summary>
									<hr />
									<ShipInput msg={this.msg} filled={input} />
								</details>
							</>
						) : (
							<ShipInput msg={this.msg} filled={input} />
						)}
					</>
				) : null}
			</div>
		</center>
	);
}

export function renderSummary(
	this: { msg: string },
	ctx: { boards: State['board']; players: Record<string, Player>; winCtx: WinCtx | { type: EndType } }
): ReactElement {
	return (
		<center>
			<p>
				{ctx.winCtx.type === 'win' ? (
					<>
						<Username name={ctx.winCtx.winner.name} /> won!
					</>
				) : (
					'The game was ended.'
				)}
			</p>
			{Object.values(ctx.players).map(player => (
				<div style={{ display: 'inline-block' }}>
					{/* ToTranslate */}
					<Username name={player.name} clickable />
					's ships
					<br />
					<br />
					<ShipGrid
						boards={{ defense: ctx.boards.attacks[player.turn === 'A' ? 'B' : 'A'], ships: ctx.boards.ships[player.turn as Turn] }}
					/>
				</div>
			))}
		</center>
	);
}

export function render(this: { msg: string }, ctx: RenderCtx): ReactElement {
	return (
		<center>
			<h1 style={ctx.dimHeader ? { color: 'gray' } : {}}>{ctx.header}</h1>
			{ctx.type === 'player' ? (
				<div>
					<ShipGrid boards={ctx.attack} clickable msg={this.msg} />
					<ShipGrid boards={{ defense: ctx.defense, ships: ctx.actual }} msg={this.msg} />
				</div>
			) : (
				<>
					<div>
						<Username name={ctx.players.A.name} clickable />
						's ships
						<ShipGrid boards={ctx.boards.A} />
					</div>
					<div>
						<Username name={ctx.players.B.name} clickable />
						's ships
						<ShipGrid boards={ctx.boards.B} />
					</div>
				</>
			)}
		</center>
	);
}
