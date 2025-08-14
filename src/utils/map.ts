export function mapValues<Input extends object, Mapped>(
	input: Input,
	map: (inputValue: Input[keyof Input], key: keyof Input) => Mapped
): Record<keyof Input, Mapped> {
	return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, map(value, key as keyof Input)])) as Record<
		keyof Input,
		Mapped
	>;
}

export function mapKeys<Input extends object, Mapped extends string | number>(
	input: Input,
	map: (key: keyof Input) => Mapped
): Record<Mapped, Input[keyof Input]> {
	return Object.fromEntries(Object.entries(input).map(([key, value]) => [map(key as keyof Input), value])) as Record<
		Mapped,
		Input[keyof Input]
	>;
}
