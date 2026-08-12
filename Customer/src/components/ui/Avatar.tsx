import { initials } from '../../lib/format';
import styles from './Avatar.module.css';

/** Initials circle used in the directory rows. */
export function Avatar({ name }: { name: string }) {
  return (
    <span className={styles.avatar} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
