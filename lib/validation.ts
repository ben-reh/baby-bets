export const MIN_DATE = '2026-07-18';
export const MAX_DATE = '2026-08-21';

export interface GuessFormValues {
  weight_lbs: string;
  weight_oz: string;
  birth_date: string;
  length_in: string;
}

export function validateGuess(form: GuessFormValues): string[] {
  const errors: string[] = [];

  if (form.birth_date < MIN_DATE || form.birth_date > MAX_DATE) {
    errors.push('Birth date must be between Jul 18 and Aug 21, 2026');
  }

  const totalOz = parseInt(form.weight_lbs) * 16 + parseInt(form.weight_oz);
  if (isNaN(totalOz) || totalOz < 80 || totalOz > 168) {
    errors.push('Weight must be between 5 lbs 0 oz and 10 lbs 8 oz');
  }

  const length = parseFloat(form.length_in);
  if (isNaN(length) || length < 17 || length > 22) {
    errors.push('Length must be between 17 and 22 inches');
  }

  return errors;
}
