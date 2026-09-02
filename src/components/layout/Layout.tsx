import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastViewport } from '../ui/ToastViewport';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import styles from './Layout.module.css';

/** Returns to the top on navigation, but leaves filter changes alone. */
function useScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
}

export function Layout() {
  useScrollToTopOnRouteChange();

  return (
    <div className={styles.shell}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      <Footer />
      <ToastViewport />
    </div>
  );
}
