import { ButtonLink } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import styles from './SimplePage.module.css';
import { usePageMeta, siteOrigin } from '../hooks/usePageMeta';
import { buildStaticMeta } from '../utils/meta';

const STEPS = [
  {
    title: 'Search what is actually available',
    text: 'Every listing comes from a garage or dealer trading in Gaborone. Filter by make, budget, body type or the area you want to collect from.',
  },
  {
    title: 'Compare properly',
    text: 'Mileage, transmission, fuel, condition and service history are stated on every listing, so you can weigh two cars against each other without guessing.',
  },
  {
    title: 'Contact the seller directly',
    text: 'Call, WhatsApp or send an enquiry. Your message arrives with the vehicle already attached, so the garage knows exactly which car you mean.',
  },
];

const CHECKLIST = [
  'View the car in daylight and take it for a proper test drive, including a stretch at highway speed.',
  'Ask to see the service book, the blue book and the seller’s Omang or company registration.',
  'Check that the engine and chassis numbers match the registration documents.',
  'Have an independent mechanic inspect anything you are serious about before you pay a deposit.',
  'Never pay a deposit for a car you have not seen, and get every agreement in writing.',
];

export function AboutPage() {
  usePageMeta(
    buildStaticMeta(siteOrigin(), '/about', 'How Motora works', "Motora is a marketplace, not a dealership. We bring the stock of garages across Gaborone into one place so you can find the right car without driving from yard to yard.", false),
  );

  return (
    <div className="page-enter">
      <section className={styles.header}>
        <div className="container page-head">
          <span className="page-head-eyebrow">About Motora</span>
          <h1 className={styles.title}>How Motora works</h1>
          <p className={styles.subtitle}>
            Motora is a marketplace, not a dealership. We bring the stock of garages across Gaborone
            into one place so you can find the right car without driving from yard to yard.
          </p>
        </div>
      </section>

      <div className={`container ${styles.content}`}>
        <div className={styles.prose}>
          <p className={styles.lead}>
            Buying a used car in Gaborone usually means a Saturday spent driving between
            Broadhurst, Mogoditshane and the Tlokweng road, hoping the car in the photo is the car
            on the forecourt. Motora exists to make that first stage quicker and more honest.
          </p>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, index) => (
            <div key={step.title} className={styles.step}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <h2 className={styles.stepTitle}>{step.title}</h2>
              <p className={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.prose}>
          <h2 className={styles.sectionTitle}>What a verified garage means</h2>
          <p className={styles.body}>
            A garage marked as verified has provided Motora with its trading licence and company
            registration, and we have confirmed the physical address of its premises. Verification
            says that the business is real and reachable. It is not a guarantee of any individual
            vehicle, and it is not a warranty.
          </p>
          <p className={styles.body}>
            Garages without the badge are not necessarily a problem. Some are newly listed and
            still working through the process. Read the listing carefully either way.
          </p>

          <h2 className={styles.sectionTitle}>Before you pay anything</h2>
          <p className={styles.body}>
            Motora does not hold money, arrange finance or take a cut of the sale. The agreement is
            between you and the garage, so a few sensible checks protect you:
          </p>

          <div className={styles.checklist}>
            {CHECKLIST.map((item) => (
              <p key={item} className={styles.checkItem}>
                <Icon name="check" size={16} className={styles.checkTick} strokeWidth={2.6} />
                {item}
              </p>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>Listing a car on Motora</h2>
          <p className={styles.body}>
            Motora is for garages and dealers rather than private sellers. If you run a yard in or
            around Gaborone and want your stock listed, email{' '}
            <a href="mailto:garages@motora.co.bw">garages@motora.co.bw</a> and we will take you
            through verification.
          </p>

          <div className={styles.ctaRow}>
            <ButtonLink to="/vehicles" variant="primary" size="lg" icon="search">
              Browse cars
            </ButtonLink>
            <ButtonLink to="/garages" variant="secondary" size="lg" icon="garage">
              See the garages
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
