import metadata from '@/ps/games/splendor/metadata.json';
import { RenderCtx, TokenType, Trainer } from '@/ps/games/splendor/types';

import type { Card } from '@/ps/games/splendor/types';
import type { CSSProperties, ReactElement } from 'react';

type This = { msg: string };

function getArtUrl(type: 'pokemon' | 'trainers' | 'type' | 'other', path: string, tag: 'img' | 'bg' = 'bg'): string {
	const baseURL = `${process.env.WEB_URL}/static/splendor/${type}/${path}`;
	return tag === 'bg' ? `url(${baseURL})` : baseURL;
}

const TOKEN_COLOURS: Record<TokenType, string> = {
	[TokenType.Colorless]: '#dddddd',
	[TokenType.Dark]: '#444444',
	[TokenType.Dragon]: '#eebe4e',
	[TokenType.Fire]: '#fe3e4e',
	[TokenType.Grass]: '#00a900',
	[TokenType.Water]: '#1996e2',
};

export function TypeToken({ type }: { type: TokenType }): ReactElement {
	const data = metadata.types[type];
	return (
		<div
			style={{
				display: 'inline-block',
				border: '1px solid black',
				background: TOKEN_COLOURS[type],
				borderRadius: 99,
				height: 108,
				width: 108,
				margin: 8,
			}}
		>
			<div
				style={{
					inset: 0,
					backgroundImage: getArtUrl('type', data.art),
					backgroundPosition: 'center',
					backgroundSize: 'cover',
					borderRadius: 99,
					height: 72,
					width: 72,
					margin: 'auto',
					position: 'relative',
					top: 18,
				}}
			/>
		</div>
	);
}

export function TypeTokenCount({ type, count }: { type: TokenType; count: number }): ReactElement {
	return (
		<div style={{ display: 'inline-block' }}>
			<TypeToken type={type} />
			<span style={{ position: 'relative', bottom: 48 }}>
				<span style={{ fontSize: 36 }}>×</span>
				<b style={{ fontSize: 54, position: 'relative', top: 4 }}>{count}</b>
			</span>
		</div>
	);
}

export function TrainerCard({ data }: { data: Trainer }): ReactElement {
	return (
		<div
			style={{
				backgroundImage: getArtUrl('trainers', data.art),
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
						padding: '8px 8px 0',
						background: '#0009',
						borderTopRightRadius: 10,
					}}
				>
					{(Object.entries(data.types) as [TokenType, number][]).map(([tokenType, cost]) => (
						<div>
							<div
								style={{
									display: 'inline-block',
									height: 24,
									width: 24,
									borderRadius: 4,
									background: TOKEN_COLOURS[tokenType],
									outline: '0.5px solid #eee8',
									outlineOffset: -2,
									position: 'relative',
								}}
							>
								<img
									src={getArtUrl('type', metadata.types[tokenType].art, 'img')}
									height="18"
									width="18"
									style={{ position: 'relative', right: 3, top: 3 }}
									alt={metadata.types[tokenType].name}
								/>
							</div>
							<span style={{ position: 'relative', bottom: 3, fontSize: 16 }}> × </span>
							<b style={{ fontSize: 24 }}>{cost}</b>
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
	style,
}: {
	data: Card;
	reserved?: boolean | undefined;
	style?: CSSProperties | undefined;
}): ReactElement {
	return (
		<div
			style={{
				backgroundImage: getArtUrl('pokemon', data.art),
				backgroundSize: 'cover',
				height: 280,
				width: 200,
				border: '1px solid black',
				borderRadius: 12,
				color: 'white',
				textShadow: '0 0 2px #000',
				position: 'relative',
				overflow: 'hidden',
				margin: 12,
				...style,
			}}
		>
			<div style={{ background: '#1119', borderBottom: '1px solid black', textAlign: 'left' }}>
				<strong style={{ fontSize: '54px', marginLeft: 12, position: 'relative', top: 4, color: reserved ? '#999' : undefined }}>
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
					borderTopRightRadius: 10,
				}}
			>
				{(Object.entries(data.cost) as [TokenType, number][]).map(([tokenType, cost]) => (
					<div>
						<img
							src={getArtUrl('type', metadata.types[tokenType].art, 'img')}
							height="42"
							width="42"
							style={{ borderRadius: 99, outline: '0.5px solid #eee8', outlineOffset: -2 }}
							alt={metadata.types[tokenType].name}
						/>
						<span style={{ position: 'relative', bottom: 10, fontSize: 24 }}> × </span>
						<b style={{ position: 'relative', bottom: 8, fontSize: 32 }}>{cost}</b>
					</div>
				))}
			</div>
		</div>
	);
}

function FlippedCard({ style }: { style?: CSSProperties | undefined }): ReactElement {
	return (
		<div
			style={{
				backgroundImage: getArtUrl('other', 'back.png'),
				backgroundSize: 'cover',
				height: 280,
				width: 200,
				border: '1px solid black',
				borderRadius: 12,
				margin: 12,
				...style,
			}}
		/>
	);
}

function PlaceholderCard({ style }: { style?: CSSProperties | undefined }): ReactElement {
	return (
		<div
			style={{
				background: '#1119',
				height: 280,
				width: 200,
				border: '4px dashed black',
				boxSizing: 'border-box',
				borderRadius: 12,
				margin: 12,
				...style,
			}}
		/>
	);
}

export function Stack({
	cards,
	hidden,
	reserved,
	style,
}: {
	cards: Card[];
	hidden?: boolean | undefined;
	reserved?: boolean | undefined;
	style?: CSSProperties | undefined;
}): ReactElement {
	return (
		<div style={{ display: 'inline-block', border: '1px dashed black', boxSizing: 'border-box', ...style }}>
			<div style={{ position: 'relative', display: 'inline-block' }}>
				{cards.length === 0 ? (
					<PlaceholderCard />
				) : (
					cards.map((card, index) =>
						hidden ? (
							<FlippedCard />
						) : (
							<PokemonCard
								data={card}
								reserved={reserved}
								style={index ? { position: 'absolute', top: index * 42, left: index * 12 } : undefined}
							/>
						)
					)
				)}
				<div style={{ height: (cards.length - 1) * 42 }} />
			</div>
			<div style={{ display: 'inline-block', width: (cards.length - 1) * 12 }} />
		</div>
	);
}
