import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { buildAlertPayload, createSearchAlert } from '../../services';
import { toApiError } from '../../services/ApiError';
import type {
  AlertChannel,
  AlertFrequency,
  SearchAlertDraft,
  SearchAlertFieldErrors,
  VehicleQuery,
} from '../../types';
import { describeQueryTitle } from '../../utils/describeQuery';
import { hasErrors } from '../../utils/validation';
import { validateSearchAlert } from '../../utils/validation';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Field';
import { Icon } from '../ui/Icon';
import styles from './SearchAlertForm.module.css';

const CHANNELS: { value: AlertChannel; label: string; icon: 'mail' | 'whatsapp' }[] = [
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
];

const FREQUENCIES: { value: AlertFrequency; label: string }[] = [
  { value: 'instant', label: 'As soon as it is listed' },
  { value: 'daily', label: 'Once a day' },
];

/**
 * Registers a saved search.
 *
 * Shown where a search finds nothing, which is the moment a customer is most
 * clearly in the market and least well served — stock here turns over weekly,
 * so an empty result usually means they arrived between deliveries.
 */
export function SearchAlertForm({ query, onDone }: { query: VehicleQuery; onDone?: () => void }) {
  const { showToast } = useToast();

  const [draft, setDraft] = useState<SearchAlertDraft>({
    email: '',
    whatsapp: '',
    channels: ['email'],
    frequency: 'instant',
  });

  const [errors, setErrors] = useState<SearchAlertFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const description = describeQueryTitle(query);

  function update<K extends keyof SearchAlertDraft>(key: K, value: SearchAlertDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function toggleChannel(channel: AlertChannel) {
    const next = draft.channels.includes(channel)
      ? draft.channels.filter((item) => item !== channel)
      : [...draft.channels, channel];

    update('channels', next);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(undefined);

    const validation = validateSearchAlert(draft);
    if (hasErrors(validation)) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);

    try {
      await createSearchAlert(buildAlertPayload(draft, query));
      setSubmitted(true);
      showToast({ tone: 'success', title: 'Alert set up', description });
    } catch (error) {
      const apiError = toApiError(error);
      setSubmitError(apiError.message);
      showToast({ tone: 'error', title: 'Alert not saved', description: apiError.message });
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
        <h3 className={styles.successTitle}>We will let you know</h3>
        <p className={styles.successText}>
          You will hear from us when a car matching <strong>{description}</strong> is listed. Every
          message has a one-tap unsubscribe link.
        </p>
        {onDone ? (
          <Button variant="primary" onClick={onDone}>
            Done
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.watching}>
        <Icon name="search" size={18} />
        <span>
          <span className={styles.watchingLabel}>We will watch for</span>
          <span className={styles.watchingValue}>{description}</span>
        </span>
      </div>

      {submitError ? (
        <p className={styles.formError} role="alert">
          <Icon name="alert" size={16} />
          {submitError}
        </p>
      ) : null}

      <TextField
        label="Email address"
        placeholder="you@example.com"
        type="email"
        autoComplete="email"
        value={draft.email}
        error={errors.email}
        onChange={(event) => update('email', event.target.value)}
      />

      <div className={styles.group}>
        <span className={styles.groupLabel}>How should we reach you?</span>
        <div className={styles.channels}>
          {CHANNELS.map((channel) => {
            const active = draft.channels.includes(channel.value);
            return (
              <button
                key={channel.value}
                type="button"
                className={[styles.channel, active ? styles.channelActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => toggleChannel(channel.value)}
                aria-pressed={active}
              >
                <Icon name={channel.icon} size={16} />
                {channel.label}
              </button>
            );
          })}
        </div>
        {errors.channels ? (
          <span className={styles.error} role="alert">
            <Icon name="alert" size={13} />
            {errors.channels}
          </span>
        ) : null}
      </div>

      {draft.channels.includes('whatsapp') ? (
        <TextField
          label="WhatsApp number"
          placeholder="71 234 567"
          type="tel"
          autoComplete="tel"
          value={draft.whatsapp ?? ''}
          error={errors.whatsapp}
          onChange={(event) => update('whatsapp', event.target.value)}
        />
      ) : null}

      <div className={styles.group}>
        <span className={styles.groupLabel}>How often?</span>
        <div className={styles.frequency}>
          {FREQUENCIES.map((option) => {
            const active = draft.frequency === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={[styles.channel, active ? styles.channelActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => update('frequency', option.value)}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" icon="mail" loading={submitting} loadingLabel="Saving…" fullWidth>
        Set up this alert
      </Button>

      <p className={styles.consent}>
        We will only message you about cars matching this search, and every message carries a
        one-tap unsubscribe link. Your details are not shared with garages unless you send them an
        enquiry yourself.
      </p>
    </form>
  );
}
