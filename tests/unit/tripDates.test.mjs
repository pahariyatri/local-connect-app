// Run: npm run test:unit   (Node's built-in runner; Node >= 22.6 strips TS types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nightsBetween, tripShape, dayNeedsStay, dateOnlyUtc, MAX_TRIP_DAYS } from '../../lib/tripDates.ts';

test('Dec 4–6 is 2 nights / 3 days (the P0 regression)', () => {
  assert.equal(nightsBetween('2026-12-04', '2026-12-06'), 2);
  const s = tripShape('2026-12-04', '2026-12-06');
  assert.deepEqual(s.days, [1, 2, 3]);
  assert.equal(s.nights, 2);
  assert.deepEqual(s.days.filter((d) => dayNeedsStay(d, s)), [1, 2], 'no stay on departure day');
});

test('same-day trip: 1 day, 0 nights, no stay', () => {
  const s = tripShape('2026-12-04', '2026-12-04');
  assert.deepEqual(s.days, [1]);
  assert.equal(s.nights, 0);
  assert.equal(s.valid, true);
  assert.equal(dayNeedsStay(1, s), false);
});

test('one night', () => {
  const s = tripShape('2026-12-04', '2026-12-05');
  assert.equal(s.nights, 1);
  assert.deepEqual(s.days.filter((d) => dayNeedsStay(d, s)), [1]);
});

test('cross-month and cross-year boundaries', () => {
  assert.equal(nightsBetween('2026-11-29', '2026-12-02'), 3);
  assert.equal(nightsBetween('2026-12-30', '2027-01-02'), 3);
  assert.equal(nightsBetween('2028-02-28', '2028-03-01'), 2, 'leap year');
  assert.equal(nightsBetween('2027-02-28', '2027-03-01'), 1, 'non-leap year');
});

test('end before start and garbage are invalid', () => {
  assert.equal(nightsBetween('2026-12-06', '2026-12-04'), null);
  assert.equal(nightsBetween('nope', '2026-12-04'), null);
  assert.equal(nightsBetween('2026-02-30', '2026-03-02'), null, 'impossible date rejected');
  const s = tripShape('2026-12-06', '2026-12-04');
  assert.equal(s.valid, false);
  assert.equal(s.nights, 0);
  assert.deepEqual(s.days, [1]);
  assert.equal(tripShape(null, null).valid, false);
});

test('ISO timestamps use the calendar date, never a UTC-shifted day', () => {
  assert.equal(nightsBetween('2026-12-04T23:30:00+05:30', '2026-12-06T00:10:00+05:30'), 2);
  assert.equal(dateOnlyUtc(new Date(2026, 11, 4, 23, 59)), Date.UTC(2026, 11, 4));
});

test('long trips are capped and flagged', () => {
  const s = tripShape('2026-12-01', '2026-12-31');
  assert.equal(s.days.length, MAX_TRIP_DAYS);
  assert.equal(s.nights, MAX_TRIP_DAYS - 1);
  assert.equal(s.truncated, true);
});
