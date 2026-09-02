import { Link } from 'react-router-dom';
import { BODY_TYPES, GABORONE_AREAS } from '../../data/taxonomy';
import { browseHref } from '../../utils/queryParams';
import { Logo } from '../common/Logo';
import { Icon } from '../ui/Icon';
import styles from './Footer.module.css';

const POPULAR_MAKES = ['Toyota', 'Ford', 'Volkswagen', 'Mazda', 'Nissan'];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.about}>
            <Link to="/" className={styles.brand}>
              <Logo height={38} alt="Motora home" />
            </Link>

            <p className={styles.blurb}>
              The modern way to find cars in Gaborone. Browse listings from verified garages and
              dealers across the city, compare them properly, and talk to the seller directly.
            </p>

            <div className={styles.contactList}>
              <a href="mailto:hello@motora.co.bw" className={styles.contactItem}>
                <Icon name="mail" size={16} />
                hello@motora.co.bw
              </a>
              <a href="tel:+2673901000" className={styles.contactItem}>
                <Icon name="phone" size={16} />
                +267 390 1000
              </a>
              <span className={styles.contactItem}>
                <Icon name="map-pin" size={16} />
                Gaborone, Botswana
              </span>
            </div>
          </div>

          <div>
            <h2 className={styles.heading}>Browse</h2>
            <ul className={styles.list}>
              <li>
                <Link to="/vehicles" className={styles.listLink}>
                  All vehicles
                </Link>
              </li>
              {POPULAR_MAKES.map((make) => (
                <li key={make}>
                  <Link to={browseHref({ make: [make] })} className={styles.listLink}>
                    {make}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.heading}>By body type</h2>
            <ul className={styles.list}>
              {BODY_TYPES.slice(0, 6).map((bodyType) => (
                <li key={bodyType}>
                  <Link to={browseHref({ bodyType: [bodyType] })} className={styles.listLink}>
                    {bodyType}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.heading}>Areas</h2>
            <ul className={styles.list}>
              {GABORONE_AREAS.slice(0, 6).map((area) => (
                <li key={area}>
                  <Link to={browseHref({ area: [area] })} className={styles.listLink}>
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Motora. Listings are supplied by third-party garages and
            dealers.
          </p>
          <span className={styles.madeIn}>
            <span className={styles.flag} aria-hidden="true" />
            Built for Botswana
          </span>
        </div>
      </div>
    </footer>
  );
}
