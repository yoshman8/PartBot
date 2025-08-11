import { createRoot } from 'react-dom/client';
import { JSONTree } from 'react-json-tree';

import { Error } from '@/web/react/components/error';

const container = document.getElementById('react-root')!;
const root = createRoot(container);

const splitPath = window.location.pathname.split('/');
const game = splitPath.at(-2)!;
const gameId = splitPath.at(-1)!;

fetch(`/api/${game}/${gameId}`)
	.then(res => res.json())
	.then(data => {
		root.render(<JSONTree data={data} shouldExpandNodeInitially={() => true} />);
	})
	.catch(err => root.render(<Error err={err} />));
