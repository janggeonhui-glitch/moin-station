import { describe, expect, it } from 'vitest';
import { LINE_COLORS } from '../data/lines';
import { contrast, readableText, shade, signBackground } from './color';

describe('color', () => {
  it('흰색–검정 대비는 21:1', () => {
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
  });

  it('밝은 노선색 위에는 어두운 글자를 쓴다', () => {
    expect(readableText(LINE_COLORS['수인분당']!)).toBe('#15201B');
    expect(readableText(LINE_COLORS['1']!)).toBe('#FFFFFF');
  });

  it('shade는 색을 어둡게 한다', () => {
    expect(shade('#808080', 0.5)).toBe('#404040');
  });

  it.each(Object.entries(LINE_COLORS))('%s 역명판 배경은 흰 글자 대비 4.5:1 이상', (_, hex) => {
    expect(contrast(signBackground(hex), '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
  });
});
