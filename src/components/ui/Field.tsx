import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Field.module.css';

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/** Label, hint and error wrapper shared by every form control. */
export function FieldShell({
  label,
  hint,
  error,
  optional,
  htmlFor,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')}>
      {label ? (
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
          {optional ? <span className={styles.optional}>(optional)</span> : null}
        </label>
      ) : null}

      {children}

      {error ? (
        <span className={styles.error} role="alert">
          <Icon name="alert" size={13} />
          {error}
        </span>
      ) : hint ? (
        <span className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  icon?: IconName;
}

export function TextField({ label, hint, error, optional, icon, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  const input = (
    <input
      id={fieldId}
      className={[styles.control, error ? styles.invalid : ''].filter(Boolean).join(' ')}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${fieldId}-error` : undefined}
      {...props}
    />
  );

  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} htmlFor={fieldId}>
      {icon ? (
        <span className={styles.withIcon}>
          <span className={styles.leadingIcon}>
            <Icon name={icon} size={18} />
          </span>
          {input}
        </span>
      ) : (
        input
      )}
    </FieldShell>
  );
}

export interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function TextAreaField({ label, hint, error, optional, id, ...props }: TextAreaFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional} htmlFor={fieldId}>
      <textarea
        id={fieldId}
        className={[styles.control, error ? styles.invalid : ''].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'children'> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell label={label} hint={hint} error={error} htmlFor={fieldId}>
      <span className={styles.selectWrap}>
        <select
          id={fieldId}
          className={[styles.control, error ? styles.invalid : ''].filter(Boolean).join(' ')}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.selectChevron}>
          <Icon name="chevron-down" size={18} />
        </span>
      </span>
    </FieldShell>
  );
}

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** Facet count shown on the right of filter checkboxes. */
  count?: number;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, count, disabled }: CheckboxProps) {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        <Icon name="check" size={12} strokeWidth={3} />
      </span>
      <span className={styles.checkboxLabel}>{label}</span>
      {count != null ? <span className={styles.count}>{count}</span> : null}
    </label>
  );
}

/** Min/max pair used for price, year and mileage. */
export function RangeFields({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  step,
  hint,
}: {
  label: string;
  minValue: number | undefined;
  maxValue: number | undefined;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  step?: number;
  hint?: string;
}) {
  const parse = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return (
    <FieldShell label={label} hint={hint}>
      <div className={styles.rangeRow}>
        <input
          type="number"
          inputMode="numeric"
          className={styles.control}
          placeholder={minPlaceholder}
          value={minValue ?? ''}
          step={step}
          onChange={(event) => onMinChange(parse(event.target.value))}
          aria-label={`${label} minimum`}
        />
        <span className={styles.rangeSeparator} aria-hidden="true">
          –
        </span>
        <input
          type="number"
          inputMode="numeric"
          className={styles.control}
          placeholder={maxPlaceholder}
          value={maxValue ?? ''}
          step={step}
          onChange={(event) => onMaxChange(parse(event.target.value))}
          aria-label={`${label} maximum`}
        />
      </div>
    </FieldShell>
  );
}
