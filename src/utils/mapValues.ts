export function mapValues<Input extends object, Mapped>(
	input: Input,
	map: (inputValue: Input[keyof Input], key: keyof Input) => Mapped
): Record<keyof Input, Mapped> {
	return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, map(value, key as keyof Input)])) as Record<
		keyof Input,
		Mapped
	>;
}
