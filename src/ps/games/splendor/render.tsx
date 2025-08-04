import type { Card, RenderCtx, Turn } from '@/ps/games/splendor/types';
import type { CSSProperties, ReactElement } from 'react';

import metadata from '@/ps/games/splendor/metadata.json';

type This = { msg: string };

function Card({ data, style }: { data: Card; style?: CSSProperties }): ReactElement {
	return (
		<div style={{ backgroundImage: data.art, height: 280, width: 200, border: 2, borderRadius: 20, ...style }}>
			<div>
				<span>{data.points}</span>
				<img src={metadata.types[data.type].art} style={{ float: 'right' }} alt={metadata.types[data.type].name} />
			</div>
		</div>
	);
}

// donotpush
export const __TEST__ = <Card data={metadata.pokemon.audino} />;
