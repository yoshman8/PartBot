import { ACTIONS, TOKEN_TYPE, VIEW_ACTION_TYPE } from '@/ps/games/splendor/constants';
import metadata from '@/ps/games/splendor/metadata.json';
import { Username } from '@/utils/components';
import { Button } from '@/utils/components/ps';

import type { ActionState, Board, Card, PlayerData, RenderCtx, TokenCount, Trainer, ViewType } from '@/ps/games/splendor/types';
import type { CSSProperties, ReactElement } from 'react';

type This = { msg: string };

// TODO: Optimize the size of the HTML produced

function getArtUrl(type: 'pokemon' | 'trainers' | 'type' | 'other', path: string, tag: 'img' | 'bg' = 'bg'): string {
	const baseURL = `${process.env.WEB_URL}/static/splendor/${type}/${path}`;
	return tag === 'bg' ? `url(${baseURL})` : baseURL;
}

const TOKEN_COLOURS: Record<TOKEN_TYPE, string> = {
	[TOKEN_TYPE.COLORLESS]: '#dddddd',
	[TOKEN_TYPE.DARK]: '#444444',
	[TOKEN_TYPE.DRAGON]: '#eebe4e',
	[TOKEN_TYPE.FIRE]: '#fe3e4e',
	[TOKEN_TYPE.GRASS]: '#00a900',
	[TOKEN_TYPE.WATER]: '#1996e2',
};

function getCardStyles(imageSrc: string | null): CSSProperties {
	return {
		...(imageSrc ? { backgroundImage: imageSrc, backgroundSize: 'cover' } : {}),
		boxSizing: 'border-box',
		height: 280,
		width: 200,
		overflow: 'hidden',
		display: 'inline-block',
		verticalAlign: 'top',
		border: '1px solid black',
		borderRadius: 12,
		padding: 0,
		margin: 12,
	};
}

export function TypeToken({ type, square }: { type: TOKEN_TYPE; square?: boolean | undefined }): ReactElement {
	const data = metadata.types[type];
	return (
		<div
			style={{
				display: 'inline-block',
				border: '1px solid black',
				background: TOKEN_COLOURS[type],
				borderRadius: square ? 12 : 99,
				height: 108,
				width: 108,
				margin: 8,
				marginBottom: -12,
			}}
		>
			<div
				style={{
					inset: 0,
					backgroundImage:
						square && type === TOKEN_TYPE.DRAGON ? getArtUrl('other', 'question-mark.png') : getArtUrl('type', data.art),
					backgroundPosition: 'center',
					backgroundSize: 'cover',
					borderRadius: 99,
					height: square ? 102 : 84,
					width: square ? 102 : 84,
					margin: 'auto',
					position: 'relative',
					top: square ? 2 : 12,
				}}
			/>
		</div>
	);
}

function TypeTokenCount({ type, count, square }: { type: TOKEN_TYPE; count: number; square?: boolean | undefined }): ReactElement {
	return (
		<div style={{ display: 'inline-block', margin: '0 12px 0 0' }}>
			<TypeToken type={type} square={square} />
			<span style={{ position: 'relative', bottom: 24, color: count === 0 ? '#aaa' : undefined }}>
				<span style={{ fontSize: 54 }}>×</span>
				<b style={{ fontSize: 72, position: 'relative', top: 6 }}>{count}</b>
			</span>
		</div>
	);
}

function TrainerCard({ data }: { data: Trainer }): ReactElement {
	return (
		<div
			style={{
				background: `${getArtUrl('trainers', data.art)} #eee8`,
				backgroundSize: 'cover',
				borderRadius: 16,
				border: '1px solid black',
				height: 144,
				width: 144,
				position: 'relative',
				overflow: 'hidden',
				color: 'white',
				display: 'inline-block',
				margin: 8,
			}}
		>
			<div style={{ background: '#1119', borderBottom: '1px solid black', textAlign: 'right' }}>
				<strong style={{ fontSize: '36px', marginRight: 12, position: 'relative', top: 4 }}>{data.points}</strong>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						padding: '8px 36px 0 18px',
						background: '#0009',
						borderTopRightRadius: 24,
						zoom: '25%',
					}}
				>
					{(Object.entries(data.types) as [TOKEN_TYPE, number][]).map(([tokenType, cost]) => (
						<div>
							<TypeTokenCount type={tokenType} count={cost} square />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function PokemonCard({
	data,
	reserved,
	onClick,
	stackIndex,
}: {
	data: Card;
	reserved?: boolean | undefined;
	onClick?: string | undefined;
	stackIndex?: number | undefined;
}): ReactElement {
	const Wrapper = onClick ? Button : 'div';

	return (
		// @ts-ignore -- Wrapper is Button only when value is provided
		<Wrapper
			{...(onClick ? { value: `${onClick} ! ${VIEW_ACTION_TYPE.CLICK_WILD} ${data.id}` } : undefined)}
			style={{
				...getCardStyles(getArtUrl('pokemon', data.art)),
				color: 'white',
				textShadow: '0 0 2px #000',
				position: 'relative',
				cursor: onClick ? 'pointer' : undefined,
				...(stackIndex
					? {
							position: 'absolute',
							top: stackIndex * 42,
							left: stackIndex * 12,
						}
					: undefined),
			}}
		>
			<div
				style={{
					background: '#1119',
					borderBottom: '1px solid black',
					textAlign: 'left',
					position: 'absolute',
					top: 0,
					width: '100%',
				}}
			>
				<strong style={{ fontSize: '54px', marginLeft: 12, position: 'relative', top: 4, color: reserved ? '#aaa' : undefined }}>
					{data.points || '\u200b'}
				</strong>
				<img
					src={getArtUrl('type', metadata.types[data.type].art, 'img')}
					height="48"
					width="48"
					style={{
						float: 'right',
						margin: 4,
						borderRadius: 99,
						outline: '0.5px solid #eeee',
						outlineOffset: -2,
					}}
					alt={metadata.types[data.type].name}
				/>
			</div>
			{reserved ? (
				<div
					style={{
						textAlign: 'center',
						marginTop: 24,
						fontSize: 32,
						color: 'yellow',
						fontWeight: 'bolder',
						position: 'absolute',
						bottom: -16,
						transform: 'rotate(90deg)',
						transformOrigin: 'right 0',
					}}
				>
					<span
						style={{
							padding: 4,
							background: '#1119',
							borderRadius: 8,
						}}
					>
						RESERVED
					</span>
				</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					padding: '8px 8px 0',
					background: '#0009',
					borderTopRightRadius: 12,
					zoom: '40%',
				}}
			>
				{(Object.entries(data.cost) as [TOKEN_TYPE, number][]).map(([tokenType, cost]) => (
					<div>
						<TypeTokenCount type={tokenType} count={cost} />
					</div>
				))}
			</div>
		</Wrapper>
	);
}

function FlippedCard({ data, count }: { data: Card; count: number }): ReactElement {
	return (
		<div style={getCardStyles(getArtUrl('other', `back-${data.tier}.png`))}>
			<div
				style={{
					position: 'relative',
					top: 96,
					background: '#1119',
					borderRadius: 12,
					color: 'white',
					textShadow: '0 0 2px #000',
					display: 'inline-block',
					padding: '0 8px 8px',
				}}
			>
				<span style={{ fontSize: 54 }}>×</span>
				<b style={{ fontSize: 72, position: 'relative', top: 6 }}>{count}</b>
			</div>
		</div>
	);
}

function PlaceholderCard(): ReactElement {
	return <div style={{ ...getCardStyles(null), background: '#1115', border: '2px dashed #eee5' }} />;
}

export function Stack({
	cards,
	hidden,
	reserved,
	onClick,
	style,
}: {
	cards: Card[];
	hidden?: boolean | undefined;
	reserved?: boolean | undefined;
	onClick?: string | undefined;
	style?: CSSProperties | undefined;
}): ReactElement {
	return (
		<div style={{ display: 'inline-block', boxSizing: 'border-box', ...style }}>
			<div style={{ position: 'relative', display: 'inline-block' }}>
				{cards.length === 0 ? (
					<PlaceholderCard />
				) : (
					cards.map((card, index) =>
						hidden ? (
							index === 0 ? (
								<FlippedCard data={card} count={cards.length} />
							) : null
						) : (
							<PokemonCard data={card} reserved={reserved} onClick={onClick} stackIndex={index} />
						)
					)
				)}
				{!hidden ? <div style={{ height: (cards.length - 1) * 42 }} /> : null}
			</div>
			{!hidden ? <div style={{ display: 'inline-block', width: (cards.length - 1) * 12 }} /> : null}
		</div>
	);
}

// TODO
function TokenInput({}: { preset: TokenCount | null; onClick: string }): ReactElement {
	return <div />;
}

// TODO
function WildCardChooser({ id }: { id: string; onClick: string }): ReactElement {
	const _data = metadata.pokemon[id];
	const _TODO = [ACTIONS.BUY, ACTIONS.RESERVE];
	return <div />;
}

// TODO
function ReservedCardInput({ card, preset, onClick }: { preset: TokenCount; card: Card; onClick: string }): ReactElement {
	return (
		<div>
			Buy {card.name}?
			<TokenInput preset={preset} onClick={onClick} />
		</div>
	);
}

export function BaseBoard({ board, view, onClick }: { board: Board; view: ViewType; onClick?: string | undefined }): ReactElement {
	return (
		<>
			{view.active && view.action === VIEW_ACTION_TYPE.CLICK_WILD ? <WildCardChooser id={view.id} onClick={onClick!} /> : null}
			<div>
				{board.trainers.map(trainer => (
					<TrainerCard data={trainer} />
				))}
			</div>
			<div style={{ zoom: '60%', color: 'white' }}>
				{[TOKEN_TYPE.COLORLESS, TOKEN_TYPE.FIRE, TOKEN_TYPE.GRASS, TOKEN_TYPE.WATER, TOKEN_TYPE.DARK, TOKEN_TYPE.DRAGON].map(
					tokenType => (
						<TypeTokenCount type={tokenType} count={board.tokens[tokenType]} />
					)
				)}
				{view.active ? (
					<Button value={`${onClick} ! ${VIEW_ACTION_TYPE.CLICK_TOKENS}`} style={{ zoom: '360%', position: 'relative', bottom: 6 }}>
						Draw Tokens
					</Button>
				) : null}
			</div>
			{view.active && view.action === VIEW_ACTION_TYPE.CLICK_TOKENS ? (
				<TokenInput preset={null} onClick={`${onClick} ! ${ACTIONS.DRAW}`} />
			) : null}
			<div style={{ height: 48 }} />
			{[board.cards[3], board.cards[2], board.cards[1]].map(({ wild, deck }) => (
				<div style={{ whiteSpace: 'nowrap', overflow: 'auto' }}>
					{wild.map(card => (
						<Stack cards={[card]} onClick={onClick ? `${onClick} ! wild` : onClick} />
					))}
					<Stack cards={deck} hidden />
				</div>
			))}
		</>
	);
}

const RESOURCE_STYLES: CSSProperties = {
	zoom: '40%',
	overflowX: 'auto',
	fontSize: 24,
	background: '#1119',
	borderRadius: 8,
	padding: '8px 12px',
	margin: 12,
};

export function ActivePlayer({ data, action, onClick }: { data: PlayerData; action: ActionState; onClick: string }): ReactElement {
	const cards = Object.entries(data.cards.groupBy(card => card.type)) as [TOKEN_TYPE, Card[]][];
	const tokensEl = (Object.entries(data.tokens) as [TOKEN_TYPE, number][]).filterMap(([tokenType, count]) =>
		count ? <TypeTokenCount type={tokenType} count={count} /> : null
	);

	return (
		<div style={{ color: 'white', fontSize: 36 }}>
			<div style={{ display: 'inline-block', verticalAlign: 'top' }}>
				<div style={{ background: '#1119', borderRadius: 12, padding: '8px 12px', margin: 12 }}>
					<b style={{ fontSize: 48 }}>{data.points}</b>
					<small>/15</small>
					<br />
					<Username name={data.name} clickable />
				</div>
				<div style={{ zoom: '75%' }}>
					{data.trainers.map(trainer => (
						<TrainerCard data={trainer} />
					))}
				</div>
			</div>
			<div style={{ display: 'inline-block', verticalAlign: 'top' }}>
				<div style={RESOURCE_STYLES}>
					<div style={{ textAlign: 'start', fontSize: 48 }}>Tokens:</div>
					{tokensEl.length ? tokensEl : '-'}
				</div>
			</div>
			{cards.length || data.reserved.length ? (
				<div style={{ display: 'inline-block', verticalAlign: 'top', margin: '0 8px' }}>
					{cards.length ? (
						<details open style={{ display: 'inline-block', verticalAlign: 'top' }}>
							<summary style={{ ...RESOURCE_STYLES, cursor: 'pointer' }}>
								{cards.map(([tokenType, { length: count }]) => (
									<TypeTokenCount type={tokenType} count={count} square />
								))}
							</summary>
							<div style={{ zoom: '75%', display: 'inline' }}>
								{cards.map(([_tokenType, card]) => (
									<Stack cards={card} />
								))}
							</div>
						</details>
					) : null}
					{data.reserved.map(card => (
						<Stack cards={[card]} onClick={`${onClick} ! ${VIEW_ACTION_TYPE.CLICK_RESERVE} ${card.id}`} reserved />
					))}
				</div>
			) : null}
			{action.action === VIEW_ACTION_TYPE.CLICK_RESERVE ? (
				action.preset ? (
					<ReservedCardInput
						card={metadata.pokemon[action.id]}
						preset={action.preset}
						onClick={`${onClick} ! ${ACTIONS.BUY_RESERVE}`}
					/>
				) : (
					<div>You can't afford this...</div>
				)
			) : null}
		</div>
	);
}

export function PlayerSummary({ data }: { data: PlayerData }): ReactElement {
	const cards = data.cards.groupBy(card => card.type);
	cards[TOKEN_TYPE.DRAGON] = data.reserved;

	const cardsEl = (Object.entries(cards) as [TOKEN_TYPE, Card[]][]).map(([tokenType, { length: count }]) => (
		<TypeTokenCount type={tokenType} count={count} square />
	));
	const tokensEl = (Object.entries(data.tokens) as [TOKEN_TYPE, number][]).filterMap(([tokenType, count]) =>
		count ? <TypeTokenCount type={tokenType} count={count} /> : null
	);

	return (
		<div style={{ color: 'white', border: '1px solid', display: 'inline-block', borderRadius: 8 }}>
			<div style={{ display: 'inline-block' }}>
				<div style={{ margin: 12 }}>
					<span
						style={{
							fontWeight: 'bold',
							fontSize: 36,
							background: '#1119',
							borderRadius: 8,
							padding: '8px 12px',
							textDecoration: data.out ? 'line-through' : undefined,
						}}
					>
						<Username name={data.name} clickable /> ({data.points})
					</span>
				</div>
				<div style={{ zoom: '60%' }}>
					{data.trainers.map(trainer => (
						<TrainerCard data={trainer} />
					))}
				</div>
			</div>
			<div style={{ display: 'inline-block' }}>
				<div style={RESOURCE_STYLES}>
					<div style={{ textAlign: 'start', fontSize: 48 }}>Cards:</div>
					{cardsEl.length ? cardsEl : '-'}
				</div>
				<div style={RESOURCE_STYLES}>
					<div style={{ textAlign: 'start', fontSize: 48 }}>Tokens:</div>
					{tokensEl.length ? tokensEl : '-'}
				</div>
			</div>
		</div>
	);
}

export function render(this: This, ctx: RenderCtx): ReactElement {
	return (
		<center>
			<h1 style={ctx.dimHeader ? { color: 'gray' } : {}}>{ctx.header}</h1>
			<div style={{ zoom: '50%' }}>
				<BaseBoard board={ctx.board} onClick={ctx.view.active ? this.msg : undefined} view={ctx.view} />
				<div style={{ height: 48 }} />
				{ctx.view.active ? (
					<>
						<ActivePlayer data={ctx.players[ctx.view.self]} action={ctx.view} onClick={this.msg} />
						<hr />
					</>
				) : null}
				{ctx.turns
					.map(turn => {
						if (ctx.view.active && turn === ctx.view.self)
							return (
								<div
									style={{
										fontSize: 36,
										background: '#1119',
										borderRadius: 8,
										padding: '12px 24px',
										display: 'inline-block',
										border: '1px solid',
									}}
								>
									<Username name={ctx.players[ctx.view.self].name} clickable />
								</div>
							);
						return <PlayerSummary data={ctx.players[turn]} />;
					})
					.space(<div style={{ height: 12 }} />)}
			</div>
		</center>
	);
}
