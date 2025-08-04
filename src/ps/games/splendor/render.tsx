import metadata from '@/ps/games/splendor/metadata.json';

import type { Card, RenderCtx, Turn, TokenType } from '@/ps/games/splendor/types';
import type { CSSProperties, ReactElement } from 'react';

type This = { msg: string };

function getArtUrl(type: 'pokemon' | 'trainer' | 'type', path: string, tag: 'img' | 'bg' = 'bg'): string {
	const baseURL = `${process.env.WEB_URL}/static/splendor/${type}/${path}`;
	return tag === 'bg' ? `url(${baseURL})` : baseURL;
}

export function Card({ data, style }: { data: Card; style?: CSSProperties }): ReactElement {
	return (
		<div
			style={{
				backgroundImage: getArtUrl('pokemon', data.art),
				backgroundSize: 'cover',
				height: 280,
				width: 200,
				border: '1px solid black',
				borderRadius: 8,
				filter: 'brightness(75%)',
				color: 'white',
				textShadow: '0 0 2px #000',
				position: 'relative',
				overflow: 'hidden',
				...style,
			}}
		>
			<div style={{ background: '#1119', borderBottom: '1px solid black', textAlign: 'left' }}>
				<strong style={{ fontSize: '32px', marginLeft: 12, position: 'relative', top: 4 }}>{data.points || null}</strong>
				<img
					src={getArtUrl('type', metadata.types[data.type].art, 'img')}
					height="32"
					width="32"
					style={{
						float: 'right',
						margin: 4,
						borderRadius: 20,
						outline: '0.5px solid #eeee',
						outlineOffset: -2,
					}}
					alt={metadata.types[data.type].name}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					padding: '8px 8px 12px 8px',
					background: '#0009',
					borderTopRightRadius: 10,
				}}
			>
				{(Object.entries(data.cost) as [TokenType, number][]).map(([tokenType, cost]) => (
					<div>
						<img
							src={getArtUrl('type', metadata.types[tokenType].art, 'img')}
							height="30"
							width="30"
							style={{ borderRadius: 20, outline: '0.5px solid #eee8', outlineOffset: -2 }}
							alt={metadata.types[data.type].name}
						/>
						<span style={{ position: 'relative', bottom: 9, fontSize: '0.7em' }}> x </span>
						<b style={{ position: 'relative', bottom: 8 }}>{cost}</b>
					</div>
				))}
			</div>
		</div>
	);
}
