import styles from './page.module.css';
import Player from '@/components/Player';
import People from '@/components/People';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.player}>
        <Player />
      </div>

      <div className={styles.people}>
        <People />
      </div>
    </main>
  );
}
