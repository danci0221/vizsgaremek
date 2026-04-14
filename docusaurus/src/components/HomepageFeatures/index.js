import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Sportkatalógus',
    emoji: '🏅',
    description: (
      <>
        Böngéssz a sportolási lehetőségek között, szűrj sportág, város,
        árkategória és napszak szerint – találd meg a hozzád illő mozgásformát.
      </>
    ),
  },
  {
    title: 'Interaktív Térkép',
    emoji: '🗺️',
    description: (
      <>
        Nézd meg a sporthelyszíneket egy Leaflet alapú térképen, klaszterezett
        markerekkel. Kattints rá és ismerd meg a részleteket azonnal.
      </>
    ),
  },
  {
    title: 'Sportkvíz Ajánló',
    emoji: '🧩',
    description: (
      <>
        Nem tudod, mit válassz? A beépített kvíz elemzi a preferenciáidat és
        személyre szabott sportajánlásokat ad neked.
      </>
    ),
  },
];

function Feature({emoji, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span style={{fontSize: '4rem', display: 'block', marginBottom: '1rem'}} role="img" aria-label={title}>
          {emoji}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
