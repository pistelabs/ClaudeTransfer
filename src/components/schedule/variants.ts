import { cva } from 'class-variance-authority';

/**
 * The schedule's variants, written the way shadcn writes a component's.
 *
 * None of this is a shadcn component — a resource grid with lane packing, buffer
 * bands and multi-fitter blocks has no counterpart to adopt — but there is no
 * reason for it to be *expressed* differently. The classes stay in
 * `styles/schedule.css`, where the design's exact geometry belongs; what a
 * variant is, and how a caller asks for one, now matches Button and Badge.
 */

export const appointmentVariants = cva('appt', {
  variants: {
    /** too short to fit the stacked time, customer and service lines */
    short: { true: 'appt--short' },
    /** overlaps another booking for a fitter it shares */
    conflict: { true: 'appt--conflict' },
    dragging: { true: 'appt--dragging' },
    /** drawn in the column of a fitter assisting rather than leading */
    assisting: { true: 'appt--assisting' },
  },
});

export const bufferVariants = cva('buffer', {
  variants: {
    side: { before: 'buffer--before', after: 'buffer--after' },
  },
});

export const walkInVariants = cva('walkin', {
  variants: {
    dragging: { true: 'walkin--dragging' },
  },
});

export const dayGroupVariants = cva('day-group', {
  variants: {
    today: { true: 'day-group--today' },
    past: { true: 'day-group--past' },
  },
});

export const columnHeadTitleVariants = cva('col-head__title', {
  variants: {
    today: { true: 'col-head__title--today' },
    past: { true: 'col-head__title--past' },
  },
});

export const scheduleColumnVariants = cva('sched-col', {
  variants: {
    /** last fitter column of a day, so the day reads as one band */
    endsDay: { true: 'sched-col--day-end' },
  },
});

export const gridHeadVariants = cva('sched-grid__head', {
  variants: {
    split: { true: 'sched-grid__head--split' },
  },
});
