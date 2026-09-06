import { useMemo } from 'react';
import { useFinanceSettings } from '../../context/FinanceSettingsContext';
import { formatPrice } from '../../utils/format';
import {
  BALLOON_BOUNDS,
  RATE_BOUNDS,
  TERM_OPTIONS,
  calculateFinance,
} from '../../utils/finance';
import { Icon } from '../ui/Icon';
import styles from './FinanceCalculator.module.css';

/**
 * Turns a cash price into an estimated monthly instalment.
 *
 * Every assumption is visible and adjustable, because the honest version of
 * this tool is one where the customer can see exactly what produced the
 * number. It is not a quote, an approval, or a recommendation to borrow.
 */
export function FinanceCalculator({ price }: { price: number }) {
  const { settings, update, reset, isDefault } = useFinanceSettings();

  const deposit = Math.round((price * settings.depositPercent) / 100);

  const result = useMemo(
    () =>
      calculateFinance({
        price,
        deposit,
        termMonths: settings.termMonths,
        annualRate: settings.annualRate,
        balloonPercent: settings.balloonPercent,
      }),
    [price, deposit, settings.termMonths, settings.annualRate, settings.balloonPercent],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.headline}>
        {result.invalid ? (
          <p className={styles.unavailable}>
            Those figures do not produce an estimate. Try a smaller deposit or a smaller balloon.
          </p>
        ) : (
          <>
            <div className={styles.headlineMain}>
              <span className={styles.headlineLabel}>Estimated instalment</span>
              <span className={styles.amount}>
                <span className={styles.amountValue}>{formatPrice(result.monthlyPayment)}</span>
                <span className={styles.amountUnit}>per month</span>
              </span>
            </div>

            <p className={styles.headlineTerms}>
              Over {settings.termMonths} months at {settings.annualRate}% a year, after a{' '}
              {formatPrice(deposit)} deposit
              {settings.balloonPercent > 0
                ? `, with ${formatPrice(result.balloonAmount)} left to settle at the end`
                : ''}
              .
            </p>
          </>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.control}>
          <div className={styles.controlHead}>
            <label className={styles.controlLabel} htmlFor="finance-deposit">
              Deposit
            </label>
            <span className={styles.controlValue}>
              {formatPrice(deposit)} ({settings.depositPercent}%)
            </span>
          </div>
          <input
            id="finance-deposit"
            type="range"
            className={styles.range}
            min={0}
            max={60}
            step={1}
            value={settings.depositPercent}
            onChange={(event) => update({ depositPercent: Number(event.target.value) })}
          />
          <span className={styles.controlHint}>
            Most lenders here ask for at least 10%, and more on older or imported vehicles.
          </span>
        </div>

        <div className={styles.control}>
          <span className={styles.controlLabel}>Repayment period</span>
          <div className={styles.terms} role="group" aria-label="Repayment period in months">
            {TERM_OPTIONS.map((term) => (
              <button
                key={term}
                type="button"
                className={[styles.term, settings.termMonths === term ? styles.termActive : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => update({ termMonths: term })}
                aria-pressed={settings.termMonths === term}
              >
                {term}m
              </button>
            ))}
          </div>
        </div>

        <div className={styles.rateRow}>
          <div className={styles.control}>
            <div className={styles.controlHead}>
              <label className={styles.controlLabel} htmlFor="finance-rate">
                Interest rate
              </label>
              <span className={styles.controlValue}>{settings.annualRate}%</span>
            </div>
            <input
              id="finance-rate"
              type="range"
              className={styles.range}
              min={RATE_BOUNDS.min}
              max={RATE_BOUNDS.max}
              step={0.25}
              value={settings.annualRate}
              onChange={(event) => update({ annualRate: Number(event.target.value) })}
            />
            <span className={styles.controlHint}>
              A starting point only. Your bank sets the real rate.
            </span>
          </div>

          <div className={styles.control}>
            <div className={styles.controlHead}>
              <label className={styles.controlLabel} htmlFor="finance-balloon">
                Balloon payment
              </label>
              <span className={styles.controlValue}>{settings.balloonPercent}%</span>
            </div>
            <input
              id="finance-balloon"
              type="range"
              className={styles.range}
              min={BALLOON_BOUNDS.min}
              max={BALLOON_BOUNDS.max}
              step={5}
              value={settings.balloonPercent}
              onChange={(event) => update({ balloonPercent: Number(event.target.value) })}
            />
            <span className={styles.controlHint}>
              Lowers the instalment, but leaves a lump sum owing at the end.
            </span>
          </div>
        </div>
      </div>

      {!result.invalid ? (
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Amount financed</span>
            <span className={styles.breakdownValue}>{formatPrice(result.amountFinanced)}</span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Total interest</span>
            <span className={styles.breakdownValue}>{formatPrice(result.totalInterest)}</span>
          </div>
          {result.balloonAmount > 0 ? (
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Balloon due</span>
              <span className={styles.breakdownValue}>{formatPrice(result.balloonAmount)}</span>
            </div>
          ) : null}
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Total you pay</span>
            <span className={styles.breakdownValue}>{formatPrice(result.totalCost)}</span>
          </div>
        </div>
      ) : null}

      {!isDefault ? (
        <div className={styles.resetRow}>
          <button type="button" className={styles.reset} onClick={reset}>
            Reset to defaults
          </button>
        </div>
      ) : null}

      <p className={styles.disclaimer}>
        <Icon name="info" size={15} />
        <span>
          An estimate, not a quote. Motora does not provide finance and cannot approve you for it.
          Banks add initiation and monthly admin fees, and usually require credit life and
          comprehensive insurance, so a real quote will come out higher than this. Speak to your
          bank for the figures that will actually apply to you.
        </span>
      </p>
    </div>
  );
}
