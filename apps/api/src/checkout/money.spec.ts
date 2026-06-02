import { describe, expect, it } from 'vitest';
import { convertUsdCentsToRoundedVnd } from './money.js';

describe('convertUsdCentsToRoundedVnd', () => {
  it('converts USD cents using integer-safe rate and rounds up to 1,000 VND', () => {
    expect(convertUsdCentsToRoundedVnd(1000, 24850)).toBe(249000);
    expect(convertUsdCentsToRoundedVnd(999, 24850)).toBe(249000);
  });

  it('keeps exact-thousand results unchanged', () => {
    expect(convertUsdCentsToRoundedVnd(1000, 25000)).toBe(250000);
  });

  it('keeps zero-price products at zero VND', () => {
    expect(convertUsdCentsToRoundedVnd(0, 24850)).toBe(0);
  });

  it('rejects invalid money inputs', () => {
    expect(() => convertUsdCentsToRoundedVnd(9.5, 24850)).toThrow('usdCents');
    expect(() => convertUsdCentsToRoundedVnd(1000, 0)).toThrow('usdToVndRate');
  });
});

