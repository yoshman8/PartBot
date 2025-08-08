import type { DetailedHTMLProps, FormHTMLAttributes, ReactElement } from 'react';

export function Form({
	value,
	children,
	...props
}: DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & { value: string }): ReactElement {
	return (
		<form data-submitsend={value} {...props}>
			{children}
		</form>
	);
}
