import type { TranslatedText } from '@/i18n/types';

/**
 * ChatErrors are pretty much identical to regular errors in structure.
 * The only difference is in semantics - a thrown ChatError should only
 * be logged as a message (eg: invalid input) and not to the logger for
 * actual errors.
 */
export class ChatError extends Error {
	constructor(args: TranslatedText) {
		super(args);
		this.name = this.constructor.name;
	}
}
