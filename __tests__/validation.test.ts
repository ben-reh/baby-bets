import { validateGuess } from '@/lib/validation';

const valid = {
  weight_lbs: '7',
  weight_oz: '8',
  birth_date: '2026-08-08',
  length_in: '20',
};

describe('validateGuess', () => {
  it('returns no errors for valid input', () => {
    expect(validateGuess(valid)).toEqual([]);
  });

  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validateGuess({ weight_lbs: '', weight_oz: '', birth_date: '2020-01-01', length_in: '' });
    expect(errors).toHaveLength(3);
  });

  describe('birth date', () => {
    it('rejects dates before Jul 18 2026', () => {
      const errors = validateGuess({ ...valid, birth_date: '2026-07-17' });
      expect(errors).toContain('Birth date must be between Jul 18 and Aug 21, 2026');
    });

    it('rejects dates after Aug 21 2026', () => {
      const errors = validateGuess({ ...valid, birth_date: '2026-08-22' });
      expect(errors).toContain('Birth date must be between Jul 18 and Aug 21, 2026');
    });

    it('accepts Jul 18 lower boundary', () => {
      expect(validateGuess({ ...valid, birth_date: '2026-07-18' })).toEqual([]);
    });

    it('accepts Aug 21 upper boundary', () => {
      expect(validateGuess({ ...valid, birth_date: '2026-08-21' })).toEqual([]);
    });
  });

  describe('weight', () => {
    it('rejects weight below 5 lbs 0 oz (80 oz)', () => {
      const errors = validateGuess({ ...valid, weight_lbs: '4', weight_oz: '15' });
      expect(errors).toContain('Weight must be between 5 lbs 0 oz and 10 lbs 8 oz');
    });

    it('rejects weight above 10 lbs 8 oz (168 oz)', () => {
      const errors = validateGuess({ ...valid, weight_lbs: '10', weight_oz: '9' });
      expect(errors).toContain('Weight must be between 5 lbs 0 oz and 10 lbs 8 oz');
    });

    it('rejects non-numeric weight', () => {
      const errors = validateGuess({ ...valid, weight_lbs: '', weight_oz: '' });
      expect(errors).toContain('Weight must be between 5 lbs 0 oz and 10 lbs 8 oz');
    });

    it('accepts lower boundary 5 lbs 0 oz', () => {
      expect(validateGuess({ ...valid, weight_lbs: '5', weight_oz: '0' })).toEqual([]);
    });

    it('accepts upper boundary 10 lbs 8 oz', () => {
      expect(validateGuess({ ...valid, weight_lbs: '10', weight_oz: '8' })).toEqual([]);
    });
  });

  describe('length', () => {
    it('rejects length below 17 inches', () => {
      const errors = validateGuess({ ...valid, length_in: '16' });
      expect(errors).toContain('Length must be between 17 and 22 inches');
    });

    it('rejects length above 22 inches', () => {
      const errors = validateGuess({ ...valid, length_in: '23' });
      expect(errors).toContain('Length must be between 17 and 22 inches');
    });

    it('rejects non-numeric length', () => {
      const errors = validateGuess({ ...valid, length_in: '' });
      expect(errors).toContain('Length must be between 17 and 22 inches');
    });

    it('accepts lower boundary 17 inches', () => {
      expect(validateGuess({ ...valid, length_in: '17' })).toEqual([]);
    });

    it('accepts upper boundary 22 inches', () => {
      expect(validateGuess({ ...valid, length_in: '22' })).toEqual([]);
    });

    it('accepts decimal lengths', () => {
      expect(validateGuess({ ...valid, length_in: '19.5' })).toEqual([]);
    });
  });
});
