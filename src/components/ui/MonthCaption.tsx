import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthAt, monthOffsetOf } from '../../lib/dates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** How far either side of this year the year list runs. */
const BACK = 1;
const AHEAD = 3;

interface MonthCaptionProps {
  /** months from the current one; 0 is this month, negative is the past */
  offset: number;
  onOffset: (next: number) => void;
}

/**
 * The head of a month calendar: an arrow either side, and the month and year as
 * dropdowns between them.
 *
 * The arrows alone are fine for next week and hopeless for next spring — a date
 * far out took a month of clicking to reach. shadcn's date picker answers this
 * with its dropdown caption, so this is that: the same two lists, over the month
 * grid this app already draws.
 */
export function MonthCaption({ offset, onOffset }: MonthCaptionProps) {
  const shown = monthAt(offset);
  const month = shown.getMonth();
  const year = shown.getFullYear();
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: BACK + AHEAD + 1 }, (_, i) => thisYear - BACK + i);

  /** Both lists answer in the same currency the calendar speaks: months from now. */
  const jump = (m: number, y: number) => onOffset(monthOffsetOf(new Date(y, m, 1)));

  return (
    <div className="calendar__nav">
      <button
        className="calendar__nav-btn"
        type="button"
        title="Previous month"
        aria-label="Previous month"
        onClick={() => onOffset(offset - 1)}
      >
        <ChevronLeft size={14} strokeWidth={2} />
      </button>

      <div className="calendar__month">
        <Select value={String(month)} onValueChange={(v) => jump(Number(v), year)}>
          <SelectTrigger className="calendar__month-select" aria-label="Month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((name, i) => (
              <SelectItem value={String(i)} key={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={(v) => jump(month, Number(v))}>
          <SelectTrigger className="calendar__year-select" aria-label="Year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem value={String(y)} key={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        className="calendar__nav-btn"
        type="button"
        title="Next month"
        aria-label="Next month"
        onClick={() => onOffset(offset + 1)}
      >
        <ChevronRight size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
