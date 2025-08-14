/* eslint-disable no-console */

/**
 * Patch out React key warnings
 * @see https://github.com/facebook/react/issues/12567
 */
const baseConsoleError = console.error.bind(console);

const keyWarningPattern = 'Warning: Each child in a list should have a unique "key" prop.';
const valueFieldPattern = 'Warning: You provided a `value` prop to a form field without an `onChange` handler.';
const checkedFieldPattern = 'Warning: You provided a `value` prop to a form field without an `onChange` handler.';

console.error = function (...args) {
	if (
		typeof args[0] === 'string' &&
		[keyWarningPattern, valueFieldPattern, checkedFieldPattern].some(pattern => args[0].startsWith(pattern))
	) {
		return;
	}
	return baseConsoleError(...args);
};
