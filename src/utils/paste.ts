import fs from 'fs/promises';

import { usePersistedCache } from '@/cache/persisted';
import { IS_ENABLED } from '@/enabled';
import { fsPath } from '@/utils/fsPath';

const pasteIdCache = usePersistedCache('pasteId');
function getNextPasteId(): string {
	const newId = pasteIdCache.get() + 1;
	pasteIdCache.set(newId);

	const idNum = (newId * 722222227) % 36 ** 6;
	return idNum.toString(36).padStart(6, '0');
}

/**
 * Uploads to the internal Paste system.
 */
export async function paste(text: string, slug: string | null = null): Promise<string | null> {
	if (!IS_ENABLED.WEB) return null;
	const id = slug ?? getNextPasteId();

	try {
		await fs.writeFile(fsPath('web', 'pastes', `${id}.txt`), text, { flag: 'wx' });
		return `${process.env.WEB_URL}/paste/${id}`;
	} catch {
		throw Error(`${id} is already taken as a Paste ID!`);
	}
}
