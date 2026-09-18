/**
 * What a host application imports.
 *
 * The console is a component, not an application: it mounts wherever the larger
 * project puts it and takes its data from whatever that project has already
 * loaded. `main.tsx` is only the standalone dev shell.
 *
 * The order matters, and only in one respect — the catalogue has to be in place
 * before the first render, because the screens read it as a module constant:
 *
 *     import { Scheduler, configureCatalogue, hydrateScheduler, loadSchedule } from 'bootfit-scheduler';
 *     import 'bootfit-scheduler/styles.css';
 *
 *     const data = await loadSchedule({ from, to });
 *     configureCatalogue({ staff: data.staff });     // before mounting
 *     hydrateScheduler(data);                        // before or after
 *     root.render(<Scheduler />);
 */
export { Scheduler } from './Scheduler';
export { configureCatalogue } from './data/catalogue';
export { useScheduler, type HydrateData } from './store/useScheduler';
export { hydrateScheduler } from './Scheduler';

// the backend seam
export { loadSchedule, createAppointment, updateAppointment, deleteAppointment, ApiError, API_BASE } from './api';
export type { ScheduleData, ScheduleQuery } from './api';
export type * from './api/types';

// the money and date conversions a host may need to match
export { formatMoney, centsFromDecimal, decimalFromCents, eur, type Cents } from './lib/money';
export { gridOf, isoAt } from './lib/dates';

export type * from './types';
