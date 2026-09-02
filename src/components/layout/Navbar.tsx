import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSavedVehicles } from '../../context/SavedVehiclesContext';
import { Logo } from '../common/Logo';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Drawer } from '../ui/Modal';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/vehicles', label: 'Browse cars' },
  { to: '/garages', label: 'Garages' },
  { to: '/about', label: 'How it works' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useSavedVehicles();
  const location = useLocation();

  // Close the mobile menu whenever navigation happens. The functional update is
  // a no-op when the menu is already closed, so this never causes a re-render.
  useEffect(() => {
    setMenuOpen((open) => (open ? false : open));
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={[styles.header, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.brand} aria-label="Motora home">
          <Logo height={24} plate alt="" />
          <span className={styles.tagline}>Gaborone</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.linkActive : ''].filter(Boolean).join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              [styles.saved, isActive ? styles.savedActive : ''].filter(Boolean).join(' ')
            }
            aria-label={count > 0 ? `Saved vehicles (${count})` : 'Saved vehicles'}
          >
            <Icon name="heart" size={20} />
            {count > 0 ? <span className={styles.savedCount}>{count > 99 ? '99+' : count}</span> : null}
          </NavLink>

          <ButtonLink
            to="/vehicles"
            variant="primary"
            size="sm"
            icon="search"
            className={styles.desktopOnly}
          >
            Find a car
          </ButtonLink>

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        footer={
          <ButtonLink to="/vehicles" variant="primary" icon="search" fullWidth>
            Find a car
          </ButtonLink>
        }
      >
        <nav className={styles.drawerNav} aria-label="Mobile">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].filter(Boolean).join(' ')
            }
          >
            <Icon name="grid" size={18} />
            Home
          </NavLink>

          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].filter(Boolean).join(' ')
              }
            >
              <Icon name={link.to === '/garages' ? 'garage' : link.to === '/about' ? 'info' : 'car'} size={18} />
              {link.label}
            </NavLink>
          ))}

          <NavLink
            to="/saved"
            className={({ isActive }) =>
              [styles.drawerLink, isActive ? styles.drawerLinkActive : ''].filter(Boolean).join(' ')
            }
          >
            <Icon name="heart" size={18} />
            Saved cars{count > 0 ? ` (${count})` : ''}
          </NavLink>
        </nav>

        <div className={styles.drawerDivider} />

        <p className={styles.drawerMeta}>
          Motora connects buyers in Gaborone with verified garages and dealers across the city.
        </p>
      </Drawer>
    </header>
  );
}
