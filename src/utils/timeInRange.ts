import { Temporal } from '@js-temporal/polyfill';

export function plainTimeInRange(time: Temporal.PlainTime, range: [Temporal.PlainTime, Temporal.PlainTime]): boolean {
	const rangeCompare = Temporal.PlainTime.compare(...range);
	if (rangeCompare === 0) return Temporal.PlainTime.compare(time, range[0]) === 0;

	const insideRange = rangeCompare === -1;
	if (insideRange) {
		return Temporal.PlainTime.compare(time, range[0]) === 1 && Temporal.PlainTime.compare(time, range[1]) === -1;
	} else {
		return Temporal.PlainTime.compare(time, range[0]) === -1 && Temporal.PlainTime.compare(time, range[1]) === 1;
	}
}

export function instantInRange(
	_time: Temporal.ZonedDateTime | Temporal.Instant,
	_range: [Temporal.ZonedDateTime | Temporal.Instant, Temporal.ZonedDateTime | Temporal.Instant]
): boolean {
	const time = _time instanceof Temporal.Instant ? _time : _time.toInstant();
	const range = _range.map(point => (point instanceof Temporal.Instant ? point : point.toInstant())) as [
		Temporal.Instant,
		Temporal.Instant,
	];
	if (Temporal.Instant.compare(...range) === 0) return Temporal.Instant.compare(time, range[0]) === 0;
	return Temporal.Instant.compare(time, range[0]) === 1 && Temporal.Instant.compare(time, range[1]) === -1;
}
