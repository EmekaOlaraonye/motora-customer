import type {
  EnquiryDraft,
  EnquiryFieldErrors,
  SearchAlertDraft,
  SearchAlertFieldErrors,
} from '../types';

/**
 * Enquiry validation.
 *
 * Kept deliberately forgiving on phone format: Botswana numbers are written
 * many ways (71 234 567, +267 71 234 567, 267-71-234-567) and rejecting a
 * valid number is worse than accepting an untidy one.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(draft: EnquiryDraft): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {};

  const name = draft.name.trim();
  if (!name) errors.name = 'Please tell the garage your name.';
  else if (name.length < 2) errors.name = 'That name looks too short.';

  const email = draft.email.trim();
  if (!email) errors.email = 'An email address is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'That does not look like a valid email address.';

  const phoneDigits = draft.phone.replace(/\D/g, '');
  if (!phoneDigits) errors.phone = 'A phone number is required so the garage can call you back.';
  else if (phoneDigits.length < 8) errors.phone = 'That number looks too short.';
  else if (phoneDigits.length > 15) errors.phone = 'That number looks too long.';

  const message = draft.message.trim();
  if (!message) errors.message = 'Add a short message for the garage.';
  else if (message.length < 10) errors.message = 'Please add a little more detail.';
  else if (message.length > 1000) errors.message = 'Please keep the message under 1000 characters.';

  return errors;
}

export function hasErrors(errors: EnquiryFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Search alert validation.
 *
 * Email is required because it is the one channel that works without a paid
 * messaging API. WhatsApp is optional, but if the customer asks to be reached
 * there, a number has to be present.
 */
export function validateSearchAlert(draft: SearchAlertDraft): SearchAlertFieldErrors {
  const errors: SearchAlertFieldErrors = {};

  const email = draft.email.trim();
  if (!email) errors.email = 'An email address is required.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'That does not look like a valid email address.';

  if (draft.channels.length === 0) {
    errors.channels = 'Choose at least one way to be contacted.';
  }

  if (draft.channels.includes('whatsapp')) {
    const digits = (draft.whatsapp ?? '').replace(/\D/g, '');
    if (!digits) errors.whatsapp = 'Add a WhatsApp number, or untick WhatsApp.';
    else if (digits.length < 8) errors.whatsapp = 'That number looks too short.';
    else if (digits.length > 15) errors.whatsapp = 'That number looks too long.';
  }

  return errors;
}
