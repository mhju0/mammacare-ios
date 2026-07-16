import { windowEnd, isSameLocalDay, type TrialLike } from './status';

export type DayCell = { date: Date; inMonth: boolean };

export function monthMatrix(year: number, month0: number): DayCell[] {
  const startWeekday = new Date(year, month0, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, i) => {
    const dayOfMonth = i - startWeekday + 1;
    return { date: new Date(year, month0, dayOfMonth), inMonth: dayOfMonth >= 1 && dayOfMonth <= daysInMonth };
  });
}

export const sameLocalDay = isSameLocalDay;

function localDayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isInTrialWindow(date: Date, t: TrialLike): boolean {
  const day = localDayStart(date);
  return day >= localDayStart(t.startedAt) && day <= localDayStart(windowEnd(t));
}

export type DayMark = { tint: 'amber' | 'green' | 'red' | null; dot: 'red' | 'green' | null };

export function dayMark(date: Date, trials: TrialLike[], reactionDays: Date[], checkinDays: Date[]): DayMark {
  if (reactionDays.some((d) => sameLocalDay(d, date))) return { tint: 'red', dot: 'red' };

  const checkedIn = checkinDays.some((d) => sameLocalDay(d, date));
  const inWindow = trials.some((t) => t.outcome !== 'cancelled' && isInTrialWindow(date, t));
  if (inWindow) return { tint: 'amber', dot: checkedIn ? 'green' : null };
  return { tint: null, dot: checkedIn ? 'green' : null };
}
