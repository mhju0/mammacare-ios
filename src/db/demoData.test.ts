import { buildDemoHistory } from './demoData';

const now = new Date(2026, 6, 17, 12, 0, 0);
const d = buildDemoHistory(now);

describe('buildDemoHistory', () => {
  it('spans about a month of history (owner spec 2026-07-23: ~30 days)', () => {
    const earliest = Math.min(...d.trials.map((t) => t.startedAt.getTime()));
    const span = now.getTime() - earliest;
    expect(span).toBeGreaterThan(28 * 86_400_000);
    expect(span).toBeLessThan(35 * 86_400_000);
  });

  it('has exactly two reacted trials and no cancelled ones (owner spec)', () => {
    expect(d.trials.filter((t) => t.outcome === 'reacted')).toHaveLength(2);
    expect(d.trials.filter((t) => t.outcome === 'cancelled')).toHaveLength(0);
  });

  it('has exactly one active trial and it is the most recent', () => {
    const active = d.trials.filter((t) => t.outcome === null);
    expect(active).toHaveLength(1);
    const latestStart = Math.max(...d.trials.map((t) => t.startedAt.getTime()));
    expect(active[0].startedAt.getTime()).toBe(latestStart);
    expect(active[0].endedAt).toBeNull();
  });

  it('never overlaps trials: each closed trial ends before the next starts', () => {
    const sorted = [...d.trials].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      expect(prev.endedAt).not.toBeNull();
      expect(prev.endedAt!.getTime()).toBeLessThanOrEqual(sorted[i].startedAt.getTime());
    }
  });

  it('attaches every reaction and checkin to an existing trial, within its lifetime', () => {
    const byId = new Map(d.trials.map((t) => [t.id, t]));
    for (const ev of [...d.reactions, ...d.checkins]) {
      const t = byId.get(ev.trialId);
      expect(t).toBeDefined();
      expect(ev.occurredAt.getTime()).toBeGreaterThanOrEqual(t!.startedAt.getTime());
      expect(ev.occurredAt.getTime()).toBeLessThanOrEqual((t!.endedAt ?? now).getTime());
    }
  });

  it('places every event in the past', () => {
    const dates = [
      d.babyRow.birthdate!, // demo data always sets one; only the schema is nullable now
      ...d.trials.map((t) => t.startedAt),
      ...d.reactions.map((r) => r.occurredAt),
      ...d.checkins.map((c) => c.occurredAt),
    ];
    for (const dt of dates) expect(dt.getTime()).toBeLessThanOrEqual(now.getTime());
  });

  it('uses unique ids across all rows', () => {
    const ids = [
      d.babyRow.id,
      ...d.foods.map((f) => f.id),
      ...d.trials.map((t) => t.id),
      ...d.reactions.map((r) => r.id),
      ...d.checkins.map((c) => c.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes safe and reacted outcomes for a varied calendar', () => {
    const outcomes = new Set(d.trials.map((t) => t.outcome));
    expect(outcomes.has('safe')).toBe(true);
    expect(outcomes.has('reacted')).toBe(true);
  });
});
