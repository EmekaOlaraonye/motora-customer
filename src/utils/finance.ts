/**
 * Vehicle finance estimates.
 *
 * Most people buying a P350,000 bakkie in Gaborone shop against what their
 * bank will approve each month, not against the sticker price. This turns a
 * price into that number.
 *
 * It is arithmetic, not an offer. Motora is not a lender or a broker, every
 * assumption here is set by the customer, and the UI says plainly that a real
 * quote comes from a bank. Nothing in this module should ever be presented as
 * an approval, a rate the customer will actually get, or advice to borrow.
 */

export interface FinanceInputs {
  /** Cash price of the vehicle, in Pula. */
  price: number;
  /** Deposit paid up front, in Pula. */
  deposit: number;
  /** Repayment period in months. */
  termMonths: number;
  /** Nominal annual interest rate, as a percentage (11.5 means 11.5%). */
  annualRate: number;
  /**
   * Optional lump sum deferred to the end of the term, as a percentage of the
   * cash price. Common on local vehicle finance, and the reason two quotes on
   * the same car can look very different.
   */
  balloonPercent?: number;
}

export interface FinanceResult {
  /** Amount actually borrowed. */
  amountFinanced: number;
  /** Estimated instalment per month. */
  monthlyPayment: number;
  /** Lump sum still owing at the end of the term. */
  balloonAmount: number;
  /** Interest paid across the whole term. */
  totalInterest: number;
  /** Deposit + every instalment + the balloon. */
  totalCost: number;
  /** True when the inputs cannot produce a meaningful estimate. */
  invalid: boolean;
}

/** Terms Botswana lenders commonly write for vehicle finance. */
export const TERM_OPTIONS = [12, 24, 36, 48, 54, 60, 72] as const;

/**
 * Starting points, not quotes.
 *
 * The rate is deliberately a round, clearly-editable placeholder rather than a
 * scraped market figure: rates move, they differ by bank, and they depend on
 * the borrower and the age of the vehicle. Presenting a precise number here
 * would imply a precision this tool does not have.
 */
export const DEFAULT_ANNUAL_RATE = 11.5;
export const DEFAULT_DEPOSIT_PERCENT = 10;
export const DEFAULT_TERM_MONTHS = 60;

export const RATE_BOUNDS = { min: 0, max: 35 };
export const BALLOON_BOUNDS = { min: 0, max: 40 };

function isFiniteNumber(value: number): boolean {
  return typeof value === 'number' && Number.isFinite(value);
}

export function calculateFinance(inputs: FinanceInputs): FinanceResult {
  const { price, deposit, termMonths, annualRate, balloonPercent = 0 } = inputs;

  const empty: FinanceResult = {
    amountFinanced: 0,
    monthlyPayment: 0,
    balloonAmount: 0,
    totalInterest: 0,
    totalCost: 0,
    invalid: true,
  };

  if (![price, deposit, termMonths, annualRate, balloonPercent].every(isFiniteNumber)) return empty;
  if (price <= 0 || termMonths <= 0) return empty;

  // A deposit covering the whole price is a cash purchase, not finance.
  if (deposit >= price) return empty;

  const balloonAmount = Math.max(0, (price * balloonPercent) / 100);
  const amountFinanced = price - Math.max(0, deposit);

  // The balloon cannot exceed what is actually being borrowed.
  if (balloonAmount >= amountFinanced) return empty;

  const monthlyRate = annualRate / 100 / 12;

  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = (amountFinanced - balloonAmount) / termMonths;
  } else {
    // Present value of the instalments plus the discounted balloon equals the
    // amount financed, solved for the instalment.
    const discount = Math.pow(1 + monthlyRate, -termMonths);
    monthlyPayment =
      ((amountFinanced - balloonAmount * discount) * monthlyRate) / (1 - discount);
  }

  if (!isFiniteNumber(monthlyPayment) || monthlyPayment <= 0) return empty;

  const totalRepaid = monthlyPayment * termMonths + balloonAmount;
  const totalInterest = totalRepaid - amountFinanced;

  return {
    amountFinanced,
    monthlyPayment,
    balloonAmount,
    totalInterest,
    totalCost: totalRepaid + Math.max(0, deposit),
    invalid: false,
  };
}
