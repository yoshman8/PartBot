import { fsPath } from '@/utils/fsPath';
import { WebError } from '@/utils/webError';

import type { UIRouteHandler } from '@/types/web';

export const handler: UIRouteHandler = (req, res, next) => {
	const { pasteId } = req.params;
	res.sendFile(fsPath('web', 'pastes', `${pasteId}.txt`), () => {
		return next(new WebError(`Paste '${pasteId}' not found`, 404));
	});
};
