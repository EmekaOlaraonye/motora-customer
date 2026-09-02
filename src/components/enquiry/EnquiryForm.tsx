import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { buildEnquiryPayload, submitEnquiry } from '../../services';
import { toApiError } from '../../services/ApiError';
import type { EnquiryDraft, EnquiryFieldErrors, PreferredContactMethod, VehicleWithGarage } from '../../types';
import { formatPrice, vehicleTitle } from '../../utils/format';
import { hasErrors, validateEnquiry } from '../../utils/validation';
import { SafeImage } from '../common/SafeImage';
import { Button } from '../ui/Button';
import { TextAreaField, TextField } from '../ui/Field';
import { Icon, type IconName } from '../ui/Icon';
import styles from './EnquiryForm.module.css';

const CONTACT_METHODS: { value: PreferredContactMethod; label: string; icon: IconName }[] = [
  { value: 'phone', label: 'Phone call', icon: 'phone' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
  { value: 'email', label: 'Email', icon: 'mail' },
];

/** The message the customer starts from, with the listing already referenced. */
function defaultMessage(vehicle: VehicleWithGarage): string {
  return `Hello ${vehicle.garage.name}, I am interested in the ${vehicleTitle(vehicle)} listed for ${formatPrice(vehicle.price)}. Is it still available, and when could I come and view it?`;
}

export function EnquiryForm({
  vehicle,
  onDone,
}: {
  vehicle: VehicleWithGarage;
  onDone?: () => void;
}) {
  const { showToast } = useToast();

  const [draft, setDraft] = useState<EnquiryDraft>({
    name: '',
    email: '',
    phone: '',
    message: defaultMessage(vehicle),
    preferredContact: 'phone',
  });

  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof EnquiryDraft>(key: K, value: EnquiryDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    // Clear a field's error as soon as the customer starts correcting it.
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(undefined);

    const validation = validateEnquiry(draft);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);

    try {
      await submitEnquiry(buildEnquiryPayload(draft, vehicle));
      setSubmitted(true);
      showToast({
        tone: 'success',
        title: 'Enquiry sent',
        description: `${vehicle.garage.name} has your details.`,
      });
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
      showToast({
        tone: 'error',
        title: 'Enquiry not sent',
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <span className={styles.successIcon}>
          <Icon name="check" size={30} strokeWidth={2.4} />
        </span>
        <h3 className={styles.successTitle}>Your enquiry is on its way</h3>
        <p className={styles.successText}>
          {vehicle.garage.name} has received your details along with the listing for the{' '}
          {vehicleTitle(vehicle)}. Most garages reply within one working day.
        </p>
        <div className={styles.successActions}>
          <Button
            variant="secondary"
            icon="phone"
            onClick={() => {
              window.location.href = `tel:${vehicle.garage.contact.phone.replace(/\s/g, '')}`;
            }}
          >
            Call them now
          </Button>
          {onDone ? (
            <Button variant="primary" onClick={onDone}>
              Done
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.context}>
        <SafeImage
          src={vehicle.images[0]?.url ?? ''}
          alt=""
          ratio="4 / 3"
          className={styles.contextImage}
          sizes="64px"
        />
        <div className={styles.contextText}>
          <p className={styles.contextTitle}>{vehicleTitle(vehicle)}</p>
          <p className={styles.contextMeta}>
            <span className={styles.contextPrice}>{formatPrice(vehicle.price)}</span>
            {' · '}
            {vehicle.garage.name}
          </p>
        </div>
      </div>

      {submitError ? (
        <p className={styles.formError} role="alert">
          <Icon name="alert" size={16} />
          {submitError}
        </p>
      ) : null}

      <div className={styles.row}>
        <TextField
          label="Your name"
          placeholder="Kagiso Moeng"
          autoComplete="name"
          value={draft.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <TextField
          label="Phone number"
          placeholder="71 234 567"
          type="tel"
          autoComplete="tel"
          value={draft.phone}
          error={errors.phone}
          onChange={(event) => update('phone', event.target.value)}
        />
      </div>

      <TextField
        label="Email address"
        placeholder="you@example.com"
        type="email"
        autoComplete="email"
        value={draft.email}
        error={errors.email}
        onChange={(event) => update('email', event.target.value)}
      />

      <div className={styles.preference}>
        <span className={styles.preferenceLabel}>How should the garage reach you?</span>
        <div className={styles.preferenceOptions}>
          {CONTACT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              className={[
                styles.preferenceOption,
                draft.preferredContact === method.value ? styles.preferenceActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => update('preferredContact', method.value)}
              aria-pressed={draft.preferredContact === method.value}
            >
              <Icon name={method.icon} size={16} />
              {method.label}
            </button>
          ))}
        </div>
      </div>

      <TextAreaField
        label="Message"
        value={draft.message}
        error={errors.message}
        hint={`${draft.message.length} / 1000 characters`}
        maxLength={1000}
        onChange={(event) => update('message', event.target.value)}
      />

      <Button type="submit" size="lg" icon="mail" loading={submitting} loadingLabel="Sending…" fullWidth>
        Send enquiry
      </Button>

      <p className={styles.consent}>
        Your details are shared with {vehicle.garage.name} only, so they can respond about this
        vehicle. Motora does not charge you for making an enquiry.
      </p>
    </form>
  );
}
