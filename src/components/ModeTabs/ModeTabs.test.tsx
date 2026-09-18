import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ModeTabs } from './ModeTabs';

describe('ModeTabs', () => {
  it('선택된 탭만 Tab 순서에 들어간다 (roving tabindex)', () => {
    render(<ModeTabs value="taste" onChange={vi.fn()} panelId="panel" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-controls', 'panel');
  });

  it('화살표·Home·End 키로 탭을 이동한다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModeTabs value="mid" onChange={onChange} panelId="panel" />);
    const tabs = screen.getAllByRole('tab');

    tabs[0]!.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('taste');
    expect(tabs[1]).toHaveFocus();

    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('hot');

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('mid');
  });
});
