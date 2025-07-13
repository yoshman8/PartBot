import express, { type Application } from 'express';

import { fsPath } from '@/utils/fsPath';

export default async function init(app: Application): Promise<void> {
	app.get('/styles.css', (req, res) => res.sendFile(fsPath('web', 'react', 'compiled', 'styles.css')));
	app.get('/favicon.ico', (req, res) => res.sendFile(fsPath('web', 'assets', 'favicon.ico')));
	app.use('/static', express.static(fsPath('web', 'static')));
}
